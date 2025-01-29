/**
 * @author Md. Majedul Islam <https://github.com/majedul-uxbd> 
 * Software Engineer,
 * Ultra-X BD Ltd.
 *
 * @copyright All right reserved Ultra-X Asia Pacific
 * 
 * @description 
 * 
 */

const { API_STATUS_CODE } = require("../../consts/error-status");
const { pool } = require("../../../database/db");

const { setServerResponse } = require("../../common/set-server-response");
const { sendMail } = require("../../helpers/send-mail");


const checkDuplicateName = async () => {
    const _query = `
    SELECT 
        name
    FROM
        companies;
`;

    try {
        const [result] = await pool.query(_query);
        if (result.length > 0) {
            return result;
        }
        return false;
    } catch (error) {
        // console.log("🚀 ~ userLoginQuery ~ error:", error)
        return Promise.reject(error)
    }
};

const checkDuplicateEmail = async (email) => {
    const _query = `
    SELECT 
        email
    FROM
        companies
    WHERE
        email = ?;
`;

    const values = [
        email
    ];

    try {
        const [result] = await pool.query(_query, values);
        if (result.length > 0) {
            return true;
        }
        return false;
    } catch (error) {
        // console.log("🚀 ~ userLoginQuery ~ error:", error)
        return Promise.reject(error);
    }
};

const insertCompanyDataQuery = async (companyData) => {
    const query = `
	INSERT INTO
        companies
        (
            name,
            website_link,
            address,
            email,
            created_at
        )
	VALUES (?,?,?,?,?);
	`;

    const values = [
        companyData.companyName,
        companyData.website_link,
        companyData.address,
        companyData.email,
        companyData.createdAt
    ];

    try {
        const [result] = await pool.query(query, values);
        if (result.affectedRows > 0) {
            return true;
        }
        return false;
    } catch (error) {
        // console.log("🚀 ~ userLoginQuery ~ error:", error)
        return Promise.reject(error);
    }
};

/**
 * @param {string} str1 
 * @param {string} str2 
 * @param {boolean} caseInsensitive 
 * @description This function will check if the str1 and str2 are the same string or not.
 */
const compareStrings = (str1, str2, caseInsensitive = true) => {
    const splitStr1 = str1.trim().split(/\s+/);
    const splitStr2 = str2.trim().split(/\s+/);

    if (splitStr1.length === splitStr2.length) {
        for (let i = 0; i < splitStr1.length; i++) {
            if (caseInsensitive) {
                if (splitStr1[i].toLowerCase() !== splitStr2[i].toLowerCase()) {
                    return false;
                }
            } else {
                if (splitStr1[i] !== splitStr2[i]) {
                    return false;
                }
            }
        }
        return true;
    }
    return false;
}

/**
 * @description This function is use to add new company
 */
const addCompanyData = async (companyData) => {
    const lgKey = companyData.lg;
    const createdAt = new Date();
    let isMatched = false;
    try {
        const companyName = await checkDuplicateName();
        if (companyName) {
            for (const company of companyName) {
                const result = compareStrings(companyData.companyName, company.name);
                if (result) {
                    // console.log(`Match found: ${companyData.companyName} matches with ${company.name}`);
                    isMatched = true;
                    break;
                }
            }
            if (isMatched === true) {
                return Promise.reject(
                    setServerResponse(
                        API_STATUS_CODE.BAD_REQUEST,
                        'company_name_has_already_exist',
                        lgKey,
                    )
                );
            }
        }
        const isDuplicateEmail = await checkDuplicateEmail(companyData.email);
        if (isDuplicateEmail === true) {
            return Promise.reject(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'email_has_already_exist',
                    lgKey,
                )
            );
        }
        companyData = { ...companyData, createdAt: createdAt };

        const insertedData = await insertCompanyDataQuery(companyData);
        if (insertedData) {

            if (lgKey === 'ja') {
                await sendMail(
                    `Event Management Tool(EMT) <support@uxd.co.jp>`,
                    companyData.email,
                    `Welcome! Your Company Account Has Been Created`,
                    `<!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>会社登録通知</title>
                    </head>
                    <body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: 'Arial', sans-serif;">
                        <div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 0;">
                            <!-- Header -->
                            <div style="background-color: #1e3a8a; padding: 30px 40px; text-align: center;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">
                                    会社登録通知
                                </h1>
                            </div>

                            <!-- Main Content -->
                            <div style="padding: 40px; background-color: #ffffff;">
                                <!-- Greeting -->
                                <div style="margin-bottom: 30px;">
                                    <p style="font-size: 16px; color: #333333; margin: 0;">こんにちは、</p>
                                </div>

                                <!-- Success Message -->
                                <div style="background-color: #f0f9ff; border-left: 4px solid #1e3a8a; padding: 20px; margin-bottom: 30px;">
                                    <p style="margin: 0; color: #1e3a8a; font-size: 16px;">
                                        🎉 あなたの会社は正常に登録されました。
                                    </p>
                                </div>

                                <!-- Company Details -->
                                <div style="margin-bottom: 30px;">
                                    <h2 style="color: #1e3a8a; font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
                                        会社の詳細
                                    </h2>
                                    <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb;">
                                        <table style="width: 100%; border-collapse: collapse;">
                                            <tr>
                                                <td style="padding: 5px; width: 100px; color: #64748b; font-size: 14px;">会社名：</td>
                                                <td style="padding: 5px; color: #333333; font-size: 14px;">${companyData.companyName}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 5px; color: #64748b; font-size: 14px;">メール：</td>
                                                <td style="padding: 5px; color: #333333; font-size: 14px;">${companyData.email}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 5px; color: #64748b; font-size: 14px;">ウェブサイト：</td>
                                                <td style="padding: 5px; color: #333333; font-size: 14px;">${companyData.website_link}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 5px; color: #64748b; font-size: 14px;">住所：</td>
                                                <td style="padding: 5px; color: #333333; font-size: 14px;">${companyData.address}</td>
                                            </tr>
                                        </table>
                                    </div>
                                </div>

                                <!-- Support Section -->
                                <div style="background-color: #f8fafc; padding: 20px; border-radius: 6px; margin-bottom: 30px;">
                                    <p style="margin: 0; color: #64748b; font-size: 14px;">
                                        <strong style="color: #1e3a8a;">お困りですか？</strong><br>
                                        ご質問やご不明点がございましたら、サポートチームまでお気軽にお問い合わせください。
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
                );
            } else {
                await sendMail(
                    `Event Management Tool(EMT) <support@uxd.co.jp>`,
                    companyData.email,
                    `Welcome! Your Company Account Has Been Created`,
                    `<!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="utf-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Company Register Notification</title>
                        </head>
                        <body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: 'Arial', sans-serif;">
                            <div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 0;">
                                <!-- Header -->
                                <div style="background-color: #1e3a8a; padding: 30px 40px; text-align: center;">
                                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">
                                        Company Register Notification
                                    </h1>
                                </div>

                                <!-- Main Content -->
                                <div style="padding: 40px; background-color: #ffffff;">
                                    <!-- Greeting -->
                                    <div style="margin-bottom: 30px;">
                                        <p style="font-size: 16px; color: #333333; margin: 0;">Hello Sir,</p>
                                    </div>

                                    <!-- Success Message -->
                                    <div style="background-color: #f0f9ff; border-left: 4px solid #1e3a8a; padding: 20px; margin-bottom: 30px;">
                                        <p style="margin: 0; color: #1e3a8a; font-size: 16px;">
                                            🎉 Your company has been successfully registered.
                                        </p>
                                    </div>

                                    <!-- Company Details -->
                                    <div style="margin-bottom: 30px;">
                                        <h2 style="color: #1e3a8a; font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
                                            Company Details
                                        </h2>
                                        <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb;">
                                            <table style="width: 100%; border-collapse: collapse;">
                                                <tr>
                                                    <td style="padding: 5px; width: 100px; color: #64748b; font-size: 14px;">Company Name:</td>
                                                    <td style="padding: 5px; color: #333333; font-size: 14px;">${companyData.companyName}</td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 5px; color: #64748b; font-size: 14px;">Email:</td>
                                                    <td style="padding: 5px; color: #333333; font-size: 14px;">${companyData.email}</td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 5px; color: #64748b; font-size: 14px;">Website:</td>
                                                    <td style="padding: 5px; color: #333333; font-size: 14px;">${companyData.website_link}</td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 5px; color: #64748b; font-size: 14px;">Address:</td>
                                                    <td style="padding: 5px; color: #333333; font-size: 14px;">${companyData.address}</td>
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
                        </html>
                        `
                );
            }

            return Promise.resolve(
                setServerResponse(
                    API_STATUS_CODE.OK,
                    'company_created_successfully',
                    lgKey,
                )
            )
        }
    } catch (error) {
        // console.log('🚀 ~ file: add-company-data.js:249 ~ addCompanyData ~ error:', error);
        return Promise.reject(
            setServerResponse(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                'internal_server_error',
                lgKey,
            )
        )
    }
}

module.exports = {
    addCompanyData
}