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
const { setServerResponse } = require("../../common/set-server-response");
const { API_STATUS_CODE } = require("../../consts/error-status");



const checkIsOtpCorrect = async (otpData) => {
    const _query = `
        SELECT
            otp,
            email
        FROM
            otp_verification
        WHERE
            email = ? AND 
            expiry_date > UTC_TIMESTAMP()
      ORDER BY 
            id DESC
      LIMIT 1;
    `;

    const _values = [
        otpData.email,
        otpData.now
    ]

    try {
        const [result] = await pool.query(_query, _values);
        if (result.length > 0) {
            return result[0];
        } return false;
    } catch (error) {
        // console.log("🚀 ~ userLoginQuery ~ error:", error)
        return Promise.reject(error);
    }
}


/**
 * @description This function is used to verity user OTP
 */
const verifyUserOtp = async (otpData) => {
    const lgKey = otpData.lg;
    const now = new Date();
    otpData = { ...otpData, now };
    try {
        const isOtpCorrect = await checkIsOtpCorrect(otpData);
        if (isOtpCorrect.otp === String(otpData.otp)) {
            return Promise.resolve(
                setServerResponse(
                    API_STATUS_CODE.OK,
                    'otp_is_valid',
                    lgKey,
                )
            )
        } else {
            return Promise.reject(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'otp_is_invalid',
                    lgKey,
                )
            )
        }
    } catch (error) {
        // console.log('🚀 ~ file: verify-user-otp.js:82 ~ verifyUserOtp ~ error:', error);
        return Promise.reject(
            setServerResponse(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                'internal_server_error',
                lgKey,
            ))
    }

}

module.exports = {
    verifyUserOtp
}