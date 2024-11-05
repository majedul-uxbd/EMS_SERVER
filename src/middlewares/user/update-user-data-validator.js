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

const {
    isValidUserFirstName,
    isValidUserLastName,
    isValidEmail,
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
    // const userData = req.body.userData;
    const errors = [];

    const user = {
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
            errors.push("Invalid user ID ");
        }
    } else {
        delete user.id;
    }

    if (!_.isNil(user.firstName)) {
        if (!isValidUserFirstName(user.firstName)) {
            errors.push("Invalid user first name");
        }
    }

    if (!_.isNil(user.lastName)) {
        if (!isValidUserLastName(user.lastName)) {
            errors.push("Invalid user last name");
        }
    }

    // if (!_.isNil(user.email)) {
    //     if (!isValidEmail(user.email)) {
    //         errors.push("Invalid user email address");
    //     }
    // }

    if (!_.isNil(user.contact)) {
        if (!isValidUserContact(user.contact)) {
            errors.push("Invalid user contact number");
        }
    }

    if (user.role === 'visitor') {
        if (!_.isNil(user.company)) {
            if (!isValidUserCompany(user.company)) {
                errors.push("Invalid company name");
            }
        }
    } else {
        delete user.company;
    }

    if (!_.isNil(user.position)) {
        if (!isValidUserPosition(user.position)) {
            errors.push("Invalid user position");
        }
    }
    if (authData.role === 'system_admin') {
        if (!_.isNil(user.role)) {
            if (!isValidUserRole(user.role)) {
                errors.push("Invalid user role");
            }
        }
    } else {
        delete user.role
    }


    if (errors.length > 0) {
        return res.status(API_STATUS_CODE.BAD_REQUEST).send({
            status: "failed",
            message: errors,
        });
    }
    // console.log("🚀 ~ validateAddUserData ~ user:", user)
    // return
    req.body.user = user;
    next();
};

module.exports = {
    updateUserDataValidator,
};
