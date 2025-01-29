/**
 * @author Md. Majedul Islam,
 * Software Engineer,
 * Ultra-X BD Ltd.
 *
 * @copyright All right reserved Md. Majedul Islam
 * 
 * @description This middleware is used for Login validation
 * 
 */
const _ = require('lodash');
const { API_STATUS_CODE } = require('../../consts/error-status');
const { isValidEmail, isValidPassword } = require('../../common/user-data-validator');
const { setServerResponse } = require('../../common/set-server-response');


/**
 * @description This function will validate user login data
 */
const loginUserValidation = async (req, res, next) => {
    const lgKey = req.body.lg;

    const user = {
        lg: req.body.lg,
        email: req.body.email,
        password: req.body.password
    }
    if (_.isEmpty(user.email) || _.isEmpty(user.password)) {
        return res.status(API_STATUS_CODE.BAD_REQUEST).send(
            setServerResponse(
                API_STATUS_CODE.BAD_REQUEST,
                'please_enter_your_email_or_password',
                lgKey,
            )
        );
    } else {
        // Check User Information validity
        if (!isValidEmail(user.email)) {
            return res.status(API_STATUS_CODE.BAD_REQUEST).send(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'invalid_user_email_address',
                    lgKey
                )
            );
        }

        else if (!isValidPassword(user.password)) {
            return res.status(API_STATUS_CODE.BAD_REQUEST).send(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'invalid_user_password',
                    lgKey
                )
            );
        }
    }

    req.body.user = user;
    next();
}

module.exports = {
    loginUserValidation
}