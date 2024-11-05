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


// validate user email
const isValidEmail = (email) => {
    if (_.isEmpty(email)) {
        return false;
    } else {
        if (!email.match(
            /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
            return false;
        }
    }
    return true;
}

// validate user password
const isValidPassword = (password) => {
    // Regex to enforce the following rules:
    // - At least one lowercase letter
    // - At least one uppercase letter
    // - At least one digit
    // - At least one special character among @$!%*?&
    // - Minimum length of 8 characters
    // - Maximum length of 60 characters
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,60}$/;
    if (_.isEmpty(password)) {
        return false;
    } else {
        if (!passwordRegex.test(password)) {
            return false;
        }
    }
    return true;
}

/**
 * @description This function will validate user login data
 */
const loginUserValidation = async (req, res, next) => {
    const errors = [];

    const user = {
        email: req.body.email,
        password: req.body.password
    }
    if (_.isEmpty(user.email) || _.isEmpty(user.password)) {
        return res.status(API_STATUS_CODE.BAD_REQUEST).send({
            status: "failed",
            message: "please-enter-email-or-password",
        });
    } else {
        // Check User Information validity
        if (!isValidEmail(user.email)) {
            errors.push('invalid-email');
        }

        else if (!isValidPassword(user.password)) {
            errors.push('invalid-password');
        }
    }

    if (errors.length > 0) {
        return res.status(API_STATUS_CODE.BAD_REQUEST).send({
            status: "failed",
            message: "invalid-data",
            errors,
        });
    }
    req.body.user = user;
    next();
}

module.exports = {
    loginUserValidation
}