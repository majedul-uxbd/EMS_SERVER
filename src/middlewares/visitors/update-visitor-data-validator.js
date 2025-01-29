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

const { setServerResponse } = require("../../common/set-server-response");
const {
    isValidUserFirstName,
    isValidUserLastName,
    isValidEmail,
    isValidUserContact,
    isValidUserPosition,
    isValidUserCompany,
} = require("../../common/user-data-validator");
const { API_STATUS_CODE } = require("../../consts/error-status");
const _ = require('lodash');

const updateVisitorDataValidator = (req, res, next) => {
    const lgKey = req.body.jg;
    const visitor = {
        lg: req.body.lg,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        contact: req.body.contact,
        company: req.body.company,
        position: req.body.position,
        profileImg: req.body.profileImg,
    };

    if (!_.isNil(visitor.firstName)) {
        if (!isValidUserFirstName(visitor.firstName)) {
            return res.status(API_STATUS_CODE.BAD_REQUEST).send(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'invalid_user_first_name',
                    lgKey
                )
            );
        }
    }

    if (!_.isNil(visitor.lastName)) {
        if (!isValidUserLastName(visitor.lastName)) {
            return res.status(API_STATUS_CODE.BAD_REQUEST).send(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'invalid_user_last_name',
                    lgKey
                )
            );
        }
    }

    if (!_.isNil(visitor.contact)) {
        if (!isValidUserContact(visitor.contact)) {
            return res.status(API_STATUS_CODE.BAD_REQUEST).send(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'invalid_user_contact_number',
                    lgKey
                )
            );
        }
    }

    if (!_.isNil(visitor.company)) {
        if (!isValidUserCompany(visitor.company)) {
            return res.status(API_STATUS_CODE.BAD_REQUEST).send(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'invalid_user_company_name',
                    lgKey
                )
            );
        }
    }

    if (!_.isNil(visitor.position)) {
        if (!isValidUserPosition(visitor.position)) {
            return res.status(API_STATUS_CODE.BAD_REQUEST).send(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'invalid_user_position',
                    lgKey
                )
            );
        }
    }
    // console.log("🚀 ~ validateAddUserData ~ user:", user)
    // return
    req.body.visitor = visitor;
    next();
};

module.exports = {
    updateVisitorDataValidator,
};
