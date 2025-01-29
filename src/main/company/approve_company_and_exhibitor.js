const bcrypt = require("bcrypt");
const { pool } = require("../../../database/db");

const { sendMail } = require("../../helpers/send-mail");
const { API_STATUS_CODE } = require("../../consts/error-status");
const { setServerResponse } = require("../../common/set-server-response");


const checkIsCompanyDataExistQuery = async (bodyData) => {
    const query = `
        SELECT
            id
        FROM
            companies
        WHERE
            id = ? AND
            current_status = ${1};
    `;
    try {
        const [result] = await pool.query(query, bodyData.companyId);
        if (result.length > 0) {
            return Promise.resolve(true);
        } return Promise.resolve(false);
    } catch (error) {
        // console.log('🚀 ~ file: approve_company_and_exhibitor.js:23 ~ checkIsCompanyDataExistQuery ~ error:', error);
        return Promise.reject(error);
    }
}


const checkIsUserDataExistQuery = async (bodyData) => {
    const query = `
        SELECT
            id
        FROM
            user
        WHERE
            companies_id = ? AND
            is_user_active = ${0} AND
            current_status = ${1};
    `;
    try {
        const [result] = await pool.query(query, bodyData.companyId);
        if (result.length > 0) {
            return Promise.resolve(true);
        } return Promise.resolve(false);
    } catch (error) {
        // console.log('🚀 ~ file: approve_company_and_exhibitor.js:23 ~ checkIsCompanyDataExistQuery ~ error:', error);
        return Promise.reject(error);
    }
}

const updateCompanyInfoQuery = async (bodyData) => {
    const query = `
        UPDATE 
            companies 
        SET 
            is_active = 1,
            current_status = null 
        WHERE 
            id = ?;
        `;

    try {
        const [result] = await pool.query(query, bodyData.companyId);
        if (result.affectedRows > 0) {
            return Promise.resolve(true);
        } return Promise.resolve(false);
    } catch (error) {
        // console.log('🚀 ~ file: approve_company_and_exhibitor.js:23 ~ checkIsCompanyDataExistQuery ~ error:', error);
        return Promise.reject(error);
    }
}


const updateUserInfoQuery = async (bodyData) => {
    const query = `
        UPDATE 
            user 
        SET 
            is_user_active = 1,
            current_status = null 
        WHERE 
            companies_id = ? AND
            is_user_active = ${0} AND
            current_status = ${1};
        `;

    try {
        const [result] = await pool.query(query, bodyData.companyId);
        if (result.affectedRows > 0) {
            return Promise.resolve(true);
        } return Promise.resolve(false);
    } catch (error) {
        // console.log('🚀 ~ file: approve_company_and_exhibitor.js:23 ~ checkIsCompanyDataExistQuery ~ error:', error);
        return Promise.reject(error);
    }
}


const approvePendingRequest = async (bodyData) => {
    const lgKey = bodyData.lg;

    try {
        const isCompanyExist = await checkIsCompanyDataExistQuery(bodyData);
        const isUserExist = await checkIsUserDataExistQuery(bodyData);
        if (!isCompanyExist) {
            return Promise.reject(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'company_not_found',
                    lgKey,
                )
            );
        }
        if (!isUserExist) {
            return Promise.reject(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'user_not_found_of_the_company',
                    lgKey,
                )
            );
        }

        const updateCompany = await updateCompanyInfoQuery(bodyData);
        if (!updateCompany) {
            return Promise.reject(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'failed_to_active_company',
                    lgKey,
                )
            );
        }

        const updateUser = await updateUserInfoQuery(bodyData);
        if (!updateUser) {
            return Promise.reject(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'failed_to_active_user',
                    lgKey,
                )
            );
        }
        // Get company email
        const emailQuery = `
            SELECT
                name,
                email
            FROM 
                companies 
            WHERE 
                id = ?`;

        const [companyData] = await pool.query(emailQuery, bodyData.companyId);
        const name = companyData[0].name;
        const email = companyData[0].email;

        const userQuery = `
            SELECT 
                id, 
                f_name,
                l_name, 
                email, 
                password,
                position 
            FROM
                user
            WHERE 
            companies_id = ? AND
            role = 'exhibitor_admin';
        `;
        const [users] = await pool.query(userQuery, bodyData.companyId);

        const user = users[0];

        if (lgKey === 'ja') {
            await sendMail(
                `Event Management Tool(EMT) <support@uxd.co.jp>`,
                email,
                `Your Company Account Has Been Approved`,
                `<!DOCTYPE html>
                    <html>
                        <head>
                            <meta charset="utf-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>会社承認通知</title>
                        </head>
                        <body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: 'Arial', sans-serif;">
                            <div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 0;">
                                <!-- Header -->
                                <div style="background-color: #1e3a8a; padding: 30px 40px; text-align: center;">
                                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">
                                        会社承認通知
                                    </h1>
                                </div>

                                <!-- Main Content -->
                                <div style="padding: 40px; background-color: #ffffff;">
                                    <!-- Greeting -->
                                    <div style="margin-bottom: 30px;">
                                        <p style="font-size: 16px; color: #333333; margin: 0;">${name} 様、</p>
                                    </div>

                                    <!-- Success Message -->
                                    <div style="background-color: #f0f9ff; border-left: 4px solid #1e3a8a; padding: 20px; margin-bottom: 30px;">
                                        <p style="margin: 0; color: #1e3a8a; font-size: 16px;">
                                            🎉 貴社は承認され、エキシビター管理者が割り当てられました。
                                        </p>
                                    </div>

                                    <!-- User Details -->
                                    <div style="margin-bottom: 30px;">
                                        <h2 style="color: #1e3a8a; font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
                                            エキシビター管理者の詳細
                                        </h2>
                                        <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb;">
                                            <table style="width: 100%; border-collapse: collapse;">
                                                <tr>
                                                    <td style="padding: 5px; width: 100px; color: #64748b; font-size: 14px;">名前：</td>
                                                    <td style="padding: 5px; color: #333333; font-size: 14px;">${user.f_name} ${user.l_name}</td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 5px; color: #64748b; font-size: 14px;">メール：</td>
                                                    <td style="padding: 5px; color: #333333; font-size: 14px;">${user.email}</td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 5px; color: #64748b; font-size: 14px;">役職：</td>
                                                    <td style="padding: 5px; color: #333333; font-size: 14px;">${user.position}</td>
                                                </tr>
                                            </table>
                                        </div>
                                    </div>

                                    <!-- Support Section -->
                                    <div style="background-color: #f8fafc; padding: 20px; border-radius: 6px; margin-bottom: 30px;">
                                        <p style="margin: 0; color: #64748b; font-size: 14px;">
                                            <strong style="color: #1e3a8a;">お困りですか？</strong><br>
                                            ご質問やお困りの点がございましたら、サポートチームまでお気軽にお問い合わせください。
                                        </p>
                                    </div>
                                </div>

                                <!-- Footer -->
                                <div style="background-color: #f8fafc; padding: 30px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                                    <p style="margin: 0; color: #64748b; font-size: 14px;">敬具、<br>イベント管理チーム</p>
                                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                                        <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                                            このメールは自動送信です。直接返信しないでください。
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </body>
                    </html>
                    `
            )

            await sendMail(
                `Event Management Tool(EMT) <support@uxd.co.jp>`,
                user.email,
                `Your Exhibitor Account Has Been Created`,
                `
                    <!DOCTYPE html>
                    <html>
                        <head>
                            <meta charset="utf-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>エキシビター管理者アカウント詳細</title>
                        </head>
                        <body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: 'Arial', sans-serif;">
                            <div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 0;">
                                <!-- Header -->
                                <div style="background-color: #1e3a8a; padding: 30px 40px; text-align: center;">
                                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">
                                        エキシビター管理者アカウント詳細
                                    </h1>
                                </div>

                                <!-- Main Content -->
                                <div style="padding: 40px; background-color: #ffffff;">
                                    <!-- Greeting -->
                                    <div style="margin-bottom: 30px;">
                                        <p style="font-size: 16px; color: #333333; margin: 0;">${user.f_name} ${user.l_name} 様、</p>
                                    </div>

                                    <!-- Success Message -->
                                    <div style="background-color: #f0f9ff; border-left: 4px solid #1e3a8a; padding: 20px; margin-bottom: 30px;">
                                        <p style="margin: 0; color: #1e3a8a; font-size: 16px;">
                                            🎉 のエキシビター管理者に任命されました。以下はログイン情報です。
                                        </p>
                                    </div>

                                    <!-- Login Details -->
                                    <div style="margin-bottom: 30px;">
                                        <h2 style="color: #1e3a8a; font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
                                            ログイン情報
                                        </h2>
                                        <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb;">
                                            <table style="width: 100%; border-collapse: collapse;">
                                                <tr>
                                                    <td style="padding: 5px; width: 100px; color: #64748b; font-size: 14px;">メール：</td>
                                                    <td style="padding: 5px; color: #333333; font-size: 14px;">${user.email}</td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 5px; color: #64748b; font-size: 14px;">パスワード：</td>
                                                    <td style="padding: 5px; color: #333333; font-size: 14px;">${user.password}</td>
                                                </tr>
                                            </table>
                                        </div>
                                    </div>

                                    <!-- Security Notice -->
                                    <div style="background-color: #fff1f2; border-left: 4px solid #be123c; padding: 20px; margin-bottom: 30px;">
                                        <p style="margin: 0; color: #be123c; font-size: 14px;">
                                            <strong>重要なセキュリティ通知：</strong><br>
                                            初回ログイン後、速やかにパスワードを変更してください。
                                        </p>
                                    </div>

                                    <!-- Support Section -->
                                    <div style="background-color: #f8fafc; padding: 20px; border-radius: 6px; margin-bottom: 30px;">
                                        <p style="margin: 0; color: #64748b; font-size: 14px;">
                                            <strong style="color: #1e3a8a;">お困りですか？</strong><br>
                                            ご質問やご不明点がございましたら、サポートチームまでお気軽にご連絡ください。
                                        </p>
                                    </div>
                                </div>

                                <!-- Footer -->
                                <div style="background-color: #f8fafc; padding: 30px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                                    <p style="margin: 0; color: #64748b; font-size: 14px;">敬具、<br>イベント管理チーム</p>
                                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                                        <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                                            このメールは自動送信です。直接返信しないでください。
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </body>
                    </html>

                    `
            )
        } else {
            // Send email to company
            await sendMail(
                `Event Management Tool(EMT) <support@uxd.co.jp>`,
                email,
                `Your Company Account Has Been Approved`,
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
                                    <p style="font-size: 16px; color: #333333; margin: 0;">Hello,</p>
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
                `Event Management Tool(EMT) <support@uxd.co.jp>`,
                user.email,
                `Your Exhibitor Account Has Been Created`,
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
                                        🎉 You have been assigned as an Exhibitor Admin for. Below are your login credentials.
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
        }

        // Hash the password for the user after the emails are sent
        const hashedPassword = await bcrypt.hash(user.password, 10);
        const updatePasswordQuery = `UPDATE user SET password = ?, is_user_active = 1, current_status = NULL WHERE id = ?;`;
        await pool.query(updatePasswordQuery, [hashedPassword, user.id]);

        return Promise.resolve(
            setServerResponse(
                API_STATUS_CODE.OK,
                'company_approved_successfully',
                lgKey
            )
        );

    } catch (error) {
        // console.log('🚀 ~ file: approve_company_and_exhibitor.js:522 ~ approvePendingRequest ~ error:', error);
        return Promise.resolve(
            setServerResponse(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                'internal_server_error',
                lgKey
            )
        );
    }
};

module.exports = {
    approvePendingRequest
};