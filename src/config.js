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

/**
 * OTP expire time
 */
const OTP_EXPIRED_PERIOD_IN_MINS = 15;

const emailAccount = Object.freeze({
    email: 'majedulledp3@gmail.com',
    pass: 'jibagtvhydllkziu'
})

const FRONTEND_URL = 'https://bdtmp.ultra-x.jp/ems/en';
const VERIFY_OTP_URL = 'verify-otp';
const USER_LOGIN = 'login';



module.exports = {
    OTP_EXPIRED_PERIOD_IN_MINS,
    emailAccount,
    FRONTEND_URL,
    VERIFY_OTP_URL,
    USER_LOGIN
}