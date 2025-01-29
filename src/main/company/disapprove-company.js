const { sendMail } = require("../../helpers/send-mail");
const { pool } = require("../../../database/db");
const { setServerResponse } = require("../../common/set-server-response");
const { API_STATUS_CODE } = require("../../consts/error-status");

/**
 * @description This function deletes a company from the `companies` table, its associated users,
 * and sends a notification email about the disapproval.
 */
const disapprovePendingRequest = async (bodyData, reason) => {
    const companyId = bodyData.companyId;
    const lgKey = bodyData.lg;
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
            return Promise.reject(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'company_not_found',
                    lgKey,
                )
            );
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
            return Promise.reject(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'company_not_found',
                    lgKey,
                )
            );
        }
        if (lgKey === 'ja') {
            await sendMail(
                `Event Management Tool(EMT) <support@uxd.co.jp>`,
                email,
                'Your Company Account Approval Has Been Rejected',
                `<!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>会社登録ステータス更新</title>
                </head>
                <body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: 'Arial', sans-serif;">
                    <div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 0;">
                        <!-- Header -->
                        <div style="background-color: #991b1b; padding: 30px 40px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">
                                会社登録ステータス更新
                            </h1>
                        </div>

                        <!-- Main Content -->
                        <div style="padding: 40px; background-color: #ffffff;">
                            <!-- Status Message -->
                            <div style="background-color: #fef2f2; border-left: 4px solid #991b1b; padding: 20px; margin-bottom: 30px;">
                                <p style="margin: 0; color: #991b1b; font-size: 16px;">
                                    残念ながら、現時点では貴社の登録が承認されなかったことをお知らせします。
                                </p>
                            </div>

                            <!-- Reason Section -->
                            ${reason ? `
                            <div style="margin-bottom: 30px;">
                                <h2 style="color: #991b1b; font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
                                    承認されなかった理由
                                </h2>
                                <p style="margin: 0; color: #333333; font-size: 14px;">
                                    ${reason}
                                </p>
                            </div>
                            ` : `
                            <div style="margin-bottom: 30px;">
                                <p style="margin: 0; color: #333333; font-size: 14px;">
                                    現時点では具体的な詳細を共有できないことをお詫び申し上げます。追加のご質問がある場合は、サポートチームまでお問い合わせください。
                                </p>
                            </div>
                            `}

                            <!-- Support Section -->
                            <div style="background-color: #f8fafc; padding: 20px; border-radius: 6px; margin-bottom: 30px;">
                                <p style="margin: 0; color: #64748b; font-size: 14px;">
                                    <strong style="color: #991b1b;">ご質問はありますか？</strong><br>
                                    この決定について議論したい場合や説明が必要な場合は、サポートチームまでお問い合わせください。メールアドレス：
                                    <a href="mailto:support@eventmanagement.com" style="color: #991b1b; text-decoration: none;">support@eventmanagement.com</a>。
                                    また、懸念事項に対処した上で、新しい申請を提出することも可能です。
                                </p>
                            </div>
                        </div>

                        <!-- Footer -->
                        <div style="background-color: #f8fafc; padding: 30px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0; color: #64748b; font-size: 14px;">よろしくお願いいたします。<br>イベント管理チーム</p>
                            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                                <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                                    これは自動送信されたメッセージです。このメールには直接返信しないでください。
                                </p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
                `
            )
        } else {
            // Send disapproval notification email
            await sendMail(
                `Event Management Tool(EMT) <support@uxd.co.jp>`,
                email,
                'Your Company Account Approval Has Been Rejected',
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
                            ` : `
                            <div style="margin-bottom: 30px;">
                                <p style="margin: 0; color: #333333; font-size: 14px;">
                                    Unfortunately, we cannot share specific details at this time. If you have further questions, please contact our support team.
                                </p>
                            </div>
                            `}

                            <!-- Support Section -->
                            <div style="background-color: #f8fafc; padding: 20px; border-radius: 6px; margin-bottom: 30px;">
                                <p style="margin: 0; color: #64748b; font-size: 14px;">
                                    <strong style="color: #991b1b;">Questions?</strong><br>
                                    If you would like to discuss this decision or need clarification, please contact our support team at 
                                    <a href="mailto:support@eventmanagement.com" style="color: #991b1b; text-decoration: none;">support@eventmanagement.com</a>.
                                    You may also submit a new application after addressing any concerns.
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
        }
        await connection.commit();
        return Promise.resolve(
            setServerResponse(
                API_STATUS_CODE.OK,
                'request_disapproved',
                lgKey,
            )
        );
    } catch (error) {
        await connection.rollback();
        return Promise.resolve(
            setServerResponse(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                'internal_server_error',
                lgKey,
            )
        );
    } finally {
        connection.release();
    }
};

module.exports = {
    disapprovePendingRequest
};