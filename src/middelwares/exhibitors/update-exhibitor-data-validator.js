/**
 * @author Md. Majedul Islam <https://github.com/majedul-uxbd> 
 * Software Engineer,
 * Ultra-X BD Ltd.
 *
 * @copyright All right reserved Majedul
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
} = require("../../common/user-data-validator");
const { API_STATUS_CODE } = require("../../consts/error-status");
const _ = require('lodash');

const updateExhibitorDataValidator = (req, res, next) => {
    const errors = [];

    const exhibitorData = {
        id: req.body.id,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        contact: req.body.contact,
        position: req.body.position,
        profileImg: req.body.profileImg,
    };

    if (req.originalUrl === '/exhibitors/update-all') {
        if (_.isNil(exhibitorData.id) || !_.isNumber(exhibitorData.id)) {
            errors.push("Invalid exhibitor ID ");
        }
    } else {
        delete exhibitorData.id;
    }

    if (!_.isNil(exhibitorData.firstName)) {
        if (!isValidUserFirstName(exhibitorData.firstName)) {
            errors.push("Invalid user first name");
        }
    }

    if (!_.isNil(exhibitorData.lastName)) {
        if (!isValidUserLastName(exhibitorData.lastName)) {
            errors.push("Invalid user last name");
        }
    }

    if (!_.isNil(exhibitorData.email)) {
        if (!isValidEmail(exhibitorData.email)) {
            errors.push("Invalid user email address");
        }
    }

    if (!_.isNil(exhibitorData.contact)) {
        if (!isValidUserContact(exhibitorData.contact)) {
            errors.push("Invalid user contact number");
        }
    }

    if (!_.isNil(exhibitorData.position)) {
        if (!isValidUserPosition(exhibitorData.position)) {
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
    req.body.exhibitorData = exhibitorData;
    next();
};

module.exports = {
    updateExhibitorDataValidator,
};
