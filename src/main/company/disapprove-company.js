const { sendMail } = require("../../helpers/send-mail");
const { pool } = require("../../../database/db");
const { setRejectMessage } = require("../../common/set-reject-message");
const { API_STATUS_CODE } = require("../../consts/error-status");

/**
 * @description This function deletes a company from the `companies` table, its associated users,
 * and sends a notification email about the disapproval.
 */
const disapprovePendingRequest = async (companyId, reason) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Get company email before deletion
        const emailQuery = `
        SELECT email, name FROM companies
        WHERE id = ?;
        `;
        const [companyData] = await connection.query(emailQuery, [companyId]);

        if (companyData.length === 0) {
            throw setRejectMessage(API_STATUS_CODE.NOT_FOUND, 'Company not found');
        }

        const { email, name } = companyData[0];

        // Get user info before deletion
        const userQuery = `
        SELECT f_name, l_name, email, position FROM user
        WHERE companies_id = ?;
        `;
        const [users] = await connection.query(userQuery, [companyId]);

        const deleteUserQuery = `DELETE FROM user WHERE companies_id = ?;`;
        await connection.query(deleteUserQuery, [companyId]);

        // Delete the company
        const deleteCompanyQuery = `DELETE FROM companies WHERE id = ?;`;
        const [result] = await connection.query(deleteCompanyQuery, [companyId]);

        if (result.affectedRows === 0) {
            throw setRejectMessage(API_STATUS_CODE.NOT_FOUND, 'Company not found');
        }

        // Send disapproval notification email
        await sendMail(
            email,
            'EMS support@eventmanagement.com',
            `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Company Registration Status Update</title>
            </head>
            <body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: 'Arial', sans-serif;">
                <div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 0;">
                    <!-- Header -->
                    <div style="background-color: #991b1b; padding: 30px 40px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">
                            Company Registration Status Update
                        </h1>
                    </div>

                    <!-- Main Content -->
                    <div style="padding: 40px; background-color: #ffffff;">
                        <!-- Greeting -->
                        <div style="margin-bottom: 30px;">
                            <p style="font-size: 16px; color: #333333; margin: 0;">Dear ${name},</p>
                        </div>

                        <!-- Status Message -->
                        <div style="background-color: #fef2f2; border-left: 4px solid #991b1b; padding: 20px; margin-bottom: 30px;">
                            <p style="margin: 0; color: #991b1b; font-size: 16px;">
                                We regret to inform you that your company registration has not been approved at this time.
                            </p>
                        </div>

                        <!-- Reason Section -->
                        ${reason ? `
                        <div style="margin-bottom: 30px;">
                            <h2 style="color: #991b1b; font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
                                Reason for Disapproval
                            </h2>
                            <p style="margin: 0; color: #333333; font-size: 14px;">
                                ${reason}
                            </p>
                        </div>
                        ` : ''}

                        <!-- Support Section -->
                        <div style="background-color: #f8fafc; padding: 20px; border-radius: 6px; margin-bottom: 30px;">
                            <p style="margin: 0; color: #64748b; font-size: 14px;">
                                <strong style="color: #991b1b;">Questions?</strong><br>
                                If you would like to discuss this decision or need clarification, please contact our support team.
                                You may also submit a new application after addressing the concerns mentioned above.
                            </p>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div style="background-color: #f8fafc; padding: 30px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0; color: #64748b; font-size: 14px;">Best Regards,<br>The Event Management Team</p>
                        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                                This is an automated message, please do not reply directly to this email.
                            </p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            `
        );

        await connection.commit();
        return {
            status: 'success',
            message: 'Company disapproved and removed successfully'
        };
    } catch (error) {
        await connection.rollback();
        if (error.statusCode) throw error;
        throw setRejectMessage(API_STATUS_CODE.INTERNAL_SERVER_ERROR, 'Operation failed');
    } finally {
        connection.release();
    }
};

module.exports = {
    disapprovePendingRequest
};