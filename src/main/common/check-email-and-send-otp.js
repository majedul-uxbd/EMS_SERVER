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

const { pool } = require("../../../database/db");
const jwt = require('jsonwebtoken');

const { generateRandomNumber } = require("../../common/utilities/generate-random-number");
const { OTP_EXPIRED_PERIOD_IN_MINS, FRONTEND_URL, VERIFY_OTP_URL } = require('../../config');
const { setServerResponse } = require('../../common/set-server-response');
const { API_STATUS_CODE } = require('../../consts/error-status');
const { sendMail } = require("../../helpers/send-mail");

const checkIsUserEmailExistUserTable = async (email) => {
    const query = `
	SELECT
        id,
        f_name,
        l_name,
        email,
        role
	FROM
		user
	WHERE
		email = ? AND is_user_active = ${1};
	`;
    const values = [email];

    try {
        const [result] = await pool.query(query, values);

        if (result.length > 0) {
            return result[0];
        } return false;
    } catch (error) {
        // console.log("🚀 ~ userLoginQuery ~ error111:", error)
        return Promise.reject(error);
    }
};

const checkIsUserEmailExistVisitorTable = async (email) => {
    const query = `
	SELECT
        id,
        f_name,
        l_name,
        email,
        role
	FROM
		visitors
	WHERE
		email = ? AND is_user_active = ${1};
	`;
    const values = [email];

    try {
        const [result] = await pool.query(query, values);
        if (result.length > 0) {
            return result[0];
        } return false;
    } catch (error) {
        // console.log("🚀 ~ userLoginQuery ~ error:", error)
        return Promise.reject(error);
    }
};


const insertOtpData = async (data) => {
    const _query = `
	INSERT INTO
        otp_verification
        (
            email,
            otp,
            expiry_date,
            created_at
        )
	VALUES ( ?, ?, ?, ?);
	`;

    const _values = [
        data.email,
        data.otp,
        data.expiryDate,
        data.createdAt
    ];

    try {
        const [result] = await pool.query(_query, _values);
        if (result.affectedRows > 0) {
            return true;
        } return false;
    } catch (error) {
        // console.log("🚀 ~ userLoginQuery ~ error:", error)
        return Promise.reject(error)
    }
}


/**
 * @description This function will generate a unique user token
 */
const generateToken = (userInfo) => {
    const token = jwt.sign(
        {
            id: userInfo.id,
            email: userInfo.email,
            role: userInfo.role,
        },
        process.env.SECRET_KEY,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRE,
        }
    );

    return token;
};


const checkEmailAndSendOtp = async (bodyData) => {
    const email = bodyData.email;
    const lgKey = bodyData.lg;
    let userInfo;
    let data;
    const createdAt = new Date();

    try {
        userInfo = await checkIsUserEmailExistUserTable(email);

        if (userInfo === false) {
            userInfo = await checkIsUserEmailExistVisitorTable(email);
        }
        if (userInfo === false) {
            return Promise.reject(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'email_is_not_found',
                    lgKey,
                )
            )
        }
        const token = generateToken(userInfo)
        const otp = await generateRandomNumber();
        const expiryDate =
            new Date(
                new Date().getTime() +
                OTP_EXPIRED_PERIOD_IN_MINS * 60000
            );
        data = { email, otp, expiryDate, createdAt };

        const isDataInserted = await insertOtpData(data);
        const verificationUrl = `${FRONTEND_URL}/${VERIFY_OTP_URL}?token=${token}`;

        if (isDataInserted) {
            if (lgKey === 'ja') {
                await sendMail(
                    `Event Management Tool(EMT) <support@uxd.co.jp>`,
                    email,
                    `Your One-Time Password (OTP) for Verification`,
                    `<!DOCTYPE html>
                    <html>
                        <head>
                            <meta charset="utf-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>パスワードをリセット</title>
                        </head>
                        <body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: 'Arial', sans-serif;">
                            <div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 0;">
                                <!-- Header -->
                                <div style="background-color: #1e3a8a; padding: 30px 40px; text-align: center;">
                                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">
                                    🔒パスワードをリセット
                                    </h1>
                                </div>

                                <!-- Main Content -->
                                <div style="padding: 40px; background-color: #ffffff;">
                                    <!-- Greeting -->
                                    <div style="margin-bottom: 30px;">
                                        <p style="font-size: 16px; color: #333333; margin: 0;">
                                            こんにちは、
                                        </p>
                                        <p style="font-size: 15px; color: #555;">
                                            イベント管理システムアカウントのパスワードをリセットするリクエストを受け取りました。以下の確認コードを使用して続行してください：
                                        </p>
                                    </div>

                                    <!-- Verification Code -->
                                    <div style="text-align: center; margin-bottom: 30px;">
                                        <span style="display: inline-block; font-size: 22px; color: #1e3a8a; background-color: #f1f5f9; padding: 15px 20px; border-radius: 8px; border: 2px solid #1e3a8a;">
                                            ${otp}
                                        </span>
                                    </div>

                                    <!-- Reset Password Link -->
                                    <div style="text-align: center; margin: 20px 0;">
                                        <a href="${verificationUrl}" style="display: inline-block; padding: 12px 25px; background-color: #1e3a8a; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">パスワードをリセットする</a>
                                    </div>

                                    <!-- Security Notice -->
                                    <div style="background-color: #fff1f2; border-left: 4px solid #be123c; padding: 20px; margin-bottom: 30px;">
                                        <p style="margin: 0; color: #be123c; font-size: 14px;">
                                            <strong>重要なセキュリティ通知：</strong><br>
                                            このリクエストを送信していない場合は、このメールを無視するか、サポートチームにご連絡ください。
                                        </p>
                                    </div>

                                    <!-- Support Section -->
                                    <div style="background-color: #f8fafc; padding: 20px; border-radius: 6px; margin-bottom: 30px;">
                                        <p style="margin: 0; color: #64748b; font-size: 14px;">
                                            <strong style="color: #1e3a8a;">お困りですか？</strong><br>
                                            質問がある場合やサポートが必要な場合は、サポートチームまでお気軽にお問い合わせください。
                                        </p>
                                    </div>
                                    <p style="font-size: 12px; color: #777; text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                                        詳細については、<a href="mailto:support@eventmanagement.com" style="color: #1e3a8a; text-decoration: none;">support@eventmanagement.com</a> にご連絡ください。
                                    </p>
                                </div>

                                <!-- Footer -->
                                <div style="background-color: #f8fafc; padding: 30px 40px; text-align: center;">
                                    <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                                        このメールは自動送信されました。このメールに直接返信しないでください。
                                    </p>
                                </div>
                            </div>
                        </body>
                    </html>
                    `
                );
            } else {
                await sendMail(
                    `Event Management Tool(EMT) <support@uxd.co.jp>`,
                    email,
                    `Your One-Time Password (OTP) for Verification`,
                    `<!DOCTYPE html>
                    <html>
                        <head>
                            <meta charset="utf-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Reset Your Password</title>
                        </head>
                        <body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: 'Arial', sans-serif;">
                            <div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 0;">
                                <!-- Header -->
                                <div style="background-color: #1e3a8a; padding: 30px 40px; text-align: center;">
                                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">
                                    🔒Reset Your Password
                                    </h1>
                                </div>

                                <!-- Main Content -->
                                <div style="padding: 40px; background-color: #ffffff;">
                                    <!-- Greeting -->
                                    <div style="margin-bottom: 30px;">
                                        <p style="font-size: 16px; color: #333333; margin: 0;">
                                            Hello,
                                        </p>
                                        <p style="font-size: 15px; color: #555;">
                                            We received a request to reset the password for your Event Management System account. Please use the verification code below to proceed:
                                        </p>
                                    </div>

                                    <!-- Verification Code -->
                                    <div style="text-align: center; margin-bottom: 30px;">
                                        <span style="display: inline-block; font-size: 22px; color: #1e3a8a; background-color: #f1f5f9; padding: 15px 20px; border-radius: 8px; border: 2px solid #1e3a8a;">
                                            ${otp}
                                        </span>
                                    </div>

                                    <!-- Reset Password Link -->
                                    <div style="text-align: center; margin: 20px 0;">
                                        <a href="${verificationUrl}" style="display: inline-block; padding: 12px 25px; background-color: #1e3a8a; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
                                    </div>

                                    <!-- Security Notice -->
                                    <div style="background-color: #fff1f2; border-left: 4px solid #be123c; padding: 20px; margin-bottom: 30px;">
                                        <p style="margin: 0; color: #be123c; font-size: 14px;">
                                            <strong>Important Security Notice:</strong><br>
                                            If you did not request this, please ignore this email or contact our support team for assistance.
                                        </p>
                                    </div>

                                    <!-- Support Section -->
                                    <div style="background-color: #f8fafc; padding: 20px; border-radius: 6px; margin-bottom: 30px;">
                                        <p style="margin: 0; color: #64748b; font-size: 14px;">
                                            <strong style="color: #1e3a8a;">Need Help?</strong><br>
                                            If you have any questions or need assistance, our support team is here to help.
                                        </p>
                                    
                                    </div>
                                    <p style="font-size: 12px; color: #777; text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">For further assistance, contact us at <a href="mailto:support@eventmanagement.com" style="color: #1e3a8a; text-decoration: none;">support@eventmanagement.com</a>.</p>
                                </div>

                                <!-- Footer -->
                                <div style="background-color: #f8fafc; padding: 30px 40px; text-align: center; ">
                                        <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                                            This is an automated message; please do not reply directly to this email.
                                        </p>
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
                    'otp_send_successfully',
                    lgKey,
                )
            )
        }

    } catch (error) {
        console.log('🚀 ~ file: check-email-and-send-otp.js:247 ~ checkEmailAndSendOtp ~ error:', error);
        return Promise.reject(
            setServerResponse(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                'internal_server_error',
                lgKey,
            ))
    }
}

module.exports = {
    checkEmailAndSendOtp
}