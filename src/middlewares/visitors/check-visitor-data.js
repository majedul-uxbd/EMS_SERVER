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

const _ = require('lodash');
const {
    isValidUserFirstName,
    isValidUserLastName,
    isValidEmail,
    isValidUserContact,
    isValidUserPosition,
    isValidUserRole,
    isValidPassword,
    isValidUserCompany,
} = require("../../common/user-data-validator");
const { API_STATUS_CODE } = require("../../consts/error-status");
const { setServerResponse } = require('../../common/set-server-response');


/**
 * This function will validate user data
 */
const validateVisitorData = (req, res, next) => {
    const lgKey = req.body.lg;
    const visitor = {
        lg: req.body.lg,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
        contact: req.body.contact,
        company: req.body.company,
        position: req.body.position,
        role: req.body.role,
        profileImg: req.body.profileImg,
    };

    if (!isValidUserFirstName(visitor.firstName)) {
        return res.status(API_STATUS_CODE.BAD_REQUEST).send(
            setServerResponse(
                API_STATUS_CODE.BAD_REQUEST,
                'invalid_user_first_name',
                lgKey
            )
        );
    }

    if (!isValidUserLastName(visitor.lastName)) {
        return res.status(API_STATUS_CODE.BAD_REQUEST).send(
            setServerResponse(
                API_STATUS_CODE.BAD_REQUEST,
                'invalid_user_last_name',
                lgKey
            )
        );
    }

    if (!isValidEmail(visitor.email)) {
        return res.status(API_STATUS_CODE.BAD_REQUEST).send(
            setServerResponse(
                API_STATUS_CODE.BAD_REQUEST,
                'invalid_user_email_address',
                lgKey
            )
        );
    }

    if (!isValidUserContact(visitor.contact)) {
        return res.status(API_STATUS_CODE.BAD_REQUEST).send(
            setServerResponse(
                API_STATUS_CODE.BAD_REQUEST,
                'invalid_user_contact_number',
                lgKey
            )
        );
    }

    if (!isValidUserCompany(visitor.company)) {
        return res.status(API_STATUS_CODE.BAD_REQUEST).send(
            setServerResponse(
                API_STATUS_CODE.BAD_REQUEST,
                'invalid_company_name',
                lgKey
            )
        );
    }

    if (!isValidUserPosition(visitor.position)) {
        return res.status(API_STATUS_CODE.BAD_REQUEST).send(
            setServerResponse(
                API_STATUS_CODE.BAD_REQUEST,
                'invalid_user_position',
                lgKey
            )
        );
    }

    // set visitor default role
    visitor.role = 'visitor';


    if (!isValidPassword(visitor.password)) {
        return res.status(API_STATUS_CODE.BAD_REQUEST).send(
            setServerResponse(
                API_STATUS_CODE.BAD_REQUEST,
                'invalid_user_password',
                lgKey
            )
        );
    }

    // console.log("🚀 ~ validateAddUserData ~ visitor:", visitor)
    req.body.visitor = visitor;
    next();
};

module.exports = {
    validateVisitorData,
};
