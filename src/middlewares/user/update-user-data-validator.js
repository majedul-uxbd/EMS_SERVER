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
    isValidUserContact,
    isValidUserPosition,
    isValidUserRole,
    isValidUserCompany,
} = require("../../common/user-data-validator");
const { API_STATUS_CODE } = require("../../consts/error-status");
const _ = require('lodash');

/**
 * @description This function is used to validate user data
 */
const updateUserDataValidator = (req, res, next) => {
    const authData = req.auth;
    const lgKey = req.body.lg;
    // const userData = req.body.userData;

    const user = {
        lg: req.body.lg,
        id: req.body.id,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        // email: req.body.email,
        contact: req.body.contact,
        company: req.body.company,
        position: req.body.position,
        role: req.body.role,
        profileImg: req.body.profileImg,
    };

    if (req.originalUrl === '/system-admin/update') {
        if (_.isNil(user.id) || !_.isNumber(user.id)) {
            return res.status(API_STATUS_CODE.BAD_REQUEST).send(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'user_id_is_required',
                    lgKey,
                )
            );
        }
    } else {
        delete user.id;
    }

    if (!_.isNil(user.firstName)) {
        if (!isValidUserFirstName(user.firstName)) {
            return res.status(API_STATUS_CODE.BAD_REQUEST).send(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'invalid_user_first_name',
                    lgKey
                )
            );
        }
    }

    if (!_.isNil(user.lastName)) {
        if (!isValidUserLastName(user.lastName)) {
            return res.status(API_STATUS_CODE.BAD_REQUEST).send(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'invalid_user_last_name',
                    lgKey
                )
            );
        }
    }

    if (!_.isNil(user.contact)) {
        if (!isValidUserContact(user.contact)) {
            return res.status(API_STATUS_CODE.BAD_REQUEST).send(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'invalid_user_contact_number',
                    lgKey
                )
            );
        }
    }

    if (authData.role === 'visitor') {
        if (!_.isNil(user.company)) {
            if (!isValidUserCompany(user.company)) {
                return res.status(API_STATUS_CODE.BAD_REQUEST).send(
                    setServerResponse(
                        API_STATUS_CODE.BAD_REQUEST,
                        'invalid_company_name',
                        lgKey
                    )
                );
            }
        }
    } else {
        delete user.company;
    }

    if (!_.isNil(user.position)) {
        if (!isValidUserPosition(user.position)) {
            return res.status(API_STATUS_CODE.BAD_REQUEST).send(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'invalid_user_position',
                    lgKey
                )
            );
        }
    }
    if (authData.role === 'system_admin') {
        if (!_.isNil(user.role)) {
            if (!isValidUserRole(user.role)) {
                return res.status(API_STATUS_CODE.BAD_REQUEST).send(
                    setServerResponse(
                        API_STATUS_CODE.BAD_REQUEST,
                        'invalid_user_role',
                        lgKey
                    )
                );
            }
        }
    } else {
        delete user.role
    }

    // return
    req.body.user = user;
    next();
};

module.exports = {
    updateUserDataValidator,
};
