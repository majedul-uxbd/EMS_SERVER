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
} = require("../../common/user-data-validator");
const { API_STATUS_CODE } = require("../../consts/error-status");

/**
 * @description This function is used to validate exhibitor data
 */
const validateExhibitorsData = (req, res, next) => {
    const errors = [];
    const exhibitor = {
        lg: req.body.lg,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        contact: req.body.contact,
        position: req.body.position,
        role: req.body.role,
        profileImg: req.body.profileImg,
    };

    if (!isValidUserFirstName(exhibitor.firstName)) {
        errors.push("Invalid user first name");
    }

    if (!isValidUserLastName(exhibitor.lastName)) {
        errors.push("Invalid user last name");
    }

    if (!isValidEmail(exhibitor.email)) {
        errors.push("Invalid user email address");
    }

    if (!isValidUserContact(exhibitor.contact)) {
        errors.push("Invalid user contact number");
    }

    if (!isValidUserPosition(exhibitor.position)) {
        errors.push("Invalid user position");
    }

    if (exhibitor.role !== 'exhibitor' && exhibitor.role !== 'exhibitor_admin') {
        errors.push("Invalid user rolea");
    }

    if (errors.length > 0) {
        return res.status(API_STATUS_CODE.BAD_REQUEST).send(
            setServerResponse(
                API_STATUS_CODE.BAD_REQUEST,
                'invalid_data',
                exhibitor.lg,
            )
        );
    }

    req.body.exhibitor = exhibitor;
    next();
};

module.exports = {
    validateExhibitorsData,
};
