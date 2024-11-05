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
const { setRejectMessage } = require('../../common/set-reject-message');
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
        return Promise.reject(
            setRejectMessage(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                'Operation failed'
            )
        );
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
        return Promise.reject(
            setRejectMessage(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                'Operation failed'
            )
        );
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
        return Promise.reject(
            setRejectMessage(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                'Operation failed'
            )
        );
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


const checkEmailAndSendOtp = async (email) => {
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
                setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Email is not found')
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
            sendMail(
                email,
                `EMS support@eventmanagement.com`,
                `<div style="background-color: #f4f4f4; padding: 30px; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                        <h2 style="color: #1e3a8a; text-align: center; margin-bottom: 20px;">Reset Your Password</h2>
                        <p>Hello,</p>
                        <p style="font-size: 15px;">It looks like you requested to reset your password for your Event Management System account. Please use the verification code below to proceed:</p>
                        <div style="text-align: center; margin: 20px 0;">
                        <span style="display: inline-block; font-size: 20px; color: #1e3a8a; background-color: #f7f7f7; padding: 10px 15px; border-radius: 5px; border: 1px solid #1e3a8a;">${otp}</span>
                        </div>
                        <p style="font-size: 15px; text-align: center;">Or, reset your password by clicking the link below:</p>
                        <div style="text-align: center; margin: 20px 0;">
                        <a href="${verificationUrl}" style="display: inline-block; padding: 12px 25px; background-color: #1e3a8a; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
                        </div>
                        <p style="font-size: 14px;">If you did not request this, please ignore this email or contact our support team for assistance.</p>
                        <p style="font-size: 14px;">Best Regards,<br>The Event Management Team</p>
                        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
                        <p style="font-size: 12px; color: #777; text-align: center;">For further assistance, contact us at <a href="mailto:support@eventmanagement.com" style="color: #1e3a8a; text-decoration: none;">support@eventmanagement.com</a>.</p>
                    </div>
                </div>`
            );

            return Promise.resolve({
                status: 'success',
                message: 'OTP send successfully'
            })
        }

    } catch (error) {
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.INTERNAL_SERVER_ERROR, 'Internal Server Error')
        )
    }
}

module.exports = {
    checkEmailAndSendOtp
}