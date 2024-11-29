const bcrypt = require("bcrypt");
const { sendMail } = require("../../helpers/send-mail");
const { API_STATUS_CODE } = require("../../consts/error-status");
const { pool } = require("../../../database/db");

const setRejectMessage = (statusCode, message) => ({ statusCode, message });

const approvePendingRequest = async (companyId) => {
    const updateQuery = `
    UPDATE companies 
    SET 
        is_active = 1,
        current_status = null 
    WHERE id = ?
`;

    try {
        const [result] = await pool.query(updateQuery, [companyId]);

        if (result.affectedRows > 0) {
            // Get company email
            const emailQuery = `SELECT email, name FROM companies WHERE id = ?`;
            const [companyData] = await pool.query(emailQuery, [companyId]);

            if (companyData.length === 0) {
                throw setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Company email not found');
            }

            const { email, name } = companyData[0];

            const userQuery = `SELECT id, f_name, l_name, email, password, position FROM user
            WHERE companies_id = ? LIMIT 1;`;
            const [users] = await pool.query(userQuery, [companyId]);

            if (users.length === 0) {
                throw setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'User not found for this company');
            }

            const user = users[0];

            // Send email to company
            await sendMail(
                email,
                `EMS support@eventmanagement.com`,
                `<!DOCTYPE html>
                <html>
                    <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Company Approval Notification</title>
                    </head>
                    <body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: 'Arial', sans-serif;">
                        <div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 0;">
                            <!-- Header -->
                            <div style="background-color: #1e3a8a; padding: 30px 40px; text-align: center;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">
                                    Company Approval Notification
                                </h1>
                            </div>

                            <!-- Main Content -->
                            <div style="padding: 40px; background-color: #ffffff;">
                                <!-- Greeting -->
                                <div style="margin-bottom: 30px;">
                                    <p style="font-size: 16px; color: #333333; margin: 0;">Hello ${name},</p>
                                </div>

                                <!-- Success Message -->
                                <div style="background-color: #f0f9ff; border-left: 4px solid #1e3a8a; padding: 20px; margin-bottom: 30px;">
                                    <p style="margin: 0; color: #1e3a8a; font-size: 16px;">
                                        🎉 Your company has been successfully approved and an Exhibitor Admin has been assigned.
                                    </p>
                                </div>

                                <!-- User Details -->
                                <div style="margin-bottom: 30px;">
                                    <h2 style="color: #1e3a8a; font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
                                        Exhibitor Admin Details
                                    </h2>
                                    <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb;">
                                        <table style="width: 100%; border-collapse: collapse;">
                                            <tr>
                                                <td style="padding: 5px; width: 100px; color: #64748b; font-size: 14px;">Name:</td>
                                                <td style="padding: 5px; color: #333333; font-size: 14px;">${user.f_name} ${user.l_name}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 5px; color: #64748b; font-size: 14px;">Email:</td>
                                                <td style="padding: 5px; color: #333333; font-size: 14px;">${user.email}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 5px; color: #64748b; font-size: 14px;">Position:</td>
                                                <td style="padding: 5px; color: #333333; font-size: 14px;">${user.position}</td>
                                            </tr>
                                        </table>
                                    </div>
                                </div>

                                <!-- Support Section -->
                                <div style="background-color: #f8fafc; padding: 20px; border-radius: 6px; margin-bottom: 30px;">
                                    <p style="margin: 0; color: #64748b; font-size: 14px;">
                                        <strong style="color: #1e3a8a;">Need Help?</strong><br>
                                        If you have any questions or concerns, our support team is here to help.
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
                </html>`
            );

            // Send email to admin user
            await sendMail(
                user.email,
                `EMS support@eventmanagement.com`,
                `<!DOCTYPE html>
                <html>
                    <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Exhibitor Admin Account Details</title>
                    </head>
                    <body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: 'Arial', sans-serif;">
                        <div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 0;">
                            <!-- Header -->
                            <div style="background-color: #1e3a8a; padding: 30px 40px; text-align: center;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">
                                    Your Exhibitor Admin Account Details
                                </h1>
                            </div>

                            <!-- Main Content -->
                            <div style="padding: 40px; background-color: #ffffff;">
                                <!-- Greeting -->
                                <div style="margin-bottom: 30px;">
                                    <p style="font-size: 16px; color: #333333; margin: 0;">Hello ${user.f_name} ${user.l_name},</p>
                                </div>

                                <!-- Success Message -->
                                <div style="background-color: #f0f9ff; border-left: 4px solid #1e3a8a; padding: 20px; margin-bottom: 30px;">
                                    <p style="margin: 0; color: #1e3a8a; font-size: 16px;">
                                        🎉 You have been assigned as an Exhibitor Admin for ${name}. Below are your login credentials.
                                    </p>
                                </div>

                                <!-- Login Details -->
                                <div style="margin-bottom: 30px;">
                                    <h2 style="color: #1e3a8a; font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
                                        Your Login Credentials
                                    </h2>
                                    <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb;">
                                        <table style="width: 100%; border-collapse: collapse;">
                                            <tr>
                                                <td style="padding: 5px; width: 100px; color: #64748b; font-size: 14px;">Email:</td>
                                                <td style="padding: 5px; color: #333333; font-size: 14px;">${user.email}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 5px; color: #64748b; font-size: 14px;">Password:</td>
                                                <td style="padding: 5px; color: #333333; font-size: 14px;">${user.password}</td>
                                            </tr>
                                        </table>
                                    </div>
                                </div>

                                <!-- Security Notice -->
                                <div style="background-color: #fff1f2; border-left: 4px solid #be123c; padding: 20px; margin-bottom: 30px;">
                                    <p style="margin: 0; color: #be123c; font-size: 14px;">
                                        <strong>Important Security Notice:</strong><br>
                                        For security reasons, please change your password immediately after your first login.
                                    </p>
                                </div>

                                <!-- Support Section -->
                                <div style="background-color: #f8fafc; padding: 20px; border-radius: 6px; margin-bottom: 30px;">
                                    <p style="margin: 0; color: #64748b; font-size: 14px;">
                                        <strong style="color: #1e3a8a;">Need Help?</strong><br>
                                        If you have any questions or need assistance, our support team is here to help.
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
                </html>`
            );

            // Hash the password for the user after the emails are sent
            const hashedPassword = await bcrypt.hash(user.password, 10);
            const updatePasswordQuery = `UPDATE user SET password = ? WHERE id = ?;`;
            await pool.query(updatePasswordQuery, [hashedPassword, user.id]);

            return {
                status: 'success',
                message: 'Company approved successfully'
            };
        } else {
            throw setRejectMessage(
                API_STATUS_CODE.BAD_REQUEST,
                'Company not found or already approved'
            );
        }
    } catch (error) {
        if (error.statusCode) throw error;
        console.log(error)
        throw setRejectMessage(
            API_STATUS_CODE.INTERNAL_SERVER_ERROR,
            'Operation failed'
        );
    }
};

module.exports = {
    approvePendingRequest
};