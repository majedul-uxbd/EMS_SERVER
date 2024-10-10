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

const updateVisitorDataValidator = (req, res, next) => {
    const errors = [];

    const visitor = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        contact: req.body.contact,
        company: req.body.company,
        position: req.body.position,
        profileImg: req.body.profileImg,
    };

    if (!_.isNil(visitor.firstName)) {
        if (!isValidUserFirstName(visitor.firstName)) {
            errors.push("Invalid user first name");
        }
    }

    if (!_.isNil(visitor.lastName)) {
        if (!isValidUserLastName(visitor.lastName)) {
            errors.push("Invalid user last name");
        }
    }

    if (!_.isNil(visitor.email)) {
        if (!isValidEmail(visitor.email)) {
            errors.push("Invalid user email address");
        }
    }

    if (!_.isNil(visitor.contact)) {
        if (!isValidUserContact(visitor.contact)) {
            errors.push("Invalid user contact number");
        }
    }

    if (!_.isNil(visitor.company)) {
        if (!isValidUserCompany(visitor.company)) {
            errors.push("Invalid user company number");
        }
    }

    if (!_.isNil(visitor.position)) {
        if (!isValidUserPosition(visitor.position)) {
            errors.push("Invalid user position");
        }
    }

    if (errors.length > 0) {
        return res.status(API_STATUS_CODE.BAD_REQUEST).send({
            status: "failed",
            message: errors,
        });
    }
    // console.log("🚀 ~ validateAddUserData ~ user:", user)
    // return
    req.body.visitor = visitor;
    next();
};

module.exports = {
    updateVisitorDataValidator,
};
