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
 * @param {number} code 
 * @param {string} msg 
 * @description This function is used to send error messages with status code
 */
const setRejectMessage = (code, msg) => {
    return {
        statusCode: code,
        message: msg
    }
}

module.exports = {
    setRejectMessage
}