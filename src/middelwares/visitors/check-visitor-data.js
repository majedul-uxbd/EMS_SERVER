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

const validateVisitorData = (req, res, next) => {
    const errors = [];
    const visitor = {
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
        errors.push("Invalid user first name");
    }

    if (!isValidUserLastName(visitor.lastName)) {
        errors.push("Invalid user last name");
    }

    if (!isValidEmail(visitor.email)) {
        errors.push("Invalid user email address");
    }

    if (!isValidUserContact(visitor.contact)) {
        errors.push("Invalid user contact number");
    }

    if (!isValidUserCompany(visitor.company)) {
        errors.push("Invalid user company name");
    }

    if (!isValidUserPosition(visitor.position)) {
        errors.push("Invalid user position");
    }

    if (!_.isNil(visitor.role)) {
        if (!isValidUserRole(visitor.role)) {
            errors.push("Invalid user role");
        }
    } else {
        visitor.role = 'visitor';
    }

    if (!isValidPassword(visitor.password)) {
        errors.push("Invalid user password");
    }
    // console.log("🚀 ~ validateAddUserData ~ errors:", errors)

    if (errors.length > 0) {
        return res.status(API_STATUS_CODE.BAD_REQUEST).send({
            status: "failed",
            message: errors,
        });
    }
    // console.log("🚀 ~ validateAddUserData ~ visitor:", visitor)
    req.body.visitor = visitor;
    next();
};

module.exports = {
    validateVisitorData,
};
