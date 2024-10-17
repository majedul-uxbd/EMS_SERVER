/**
 * @author Md. Majedul Islam <https://github.com/majedul-uxbd> 
 * Software Engineer,
 * Ultra-X BD Ltd.
 *
 * @copyright All right reserved Majedul All right reserved Md. Majedul Islam
 * 
 * @description 
 * 
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