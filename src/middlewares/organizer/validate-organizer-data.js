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
    isValidPassword,
} = require("../../common/user-data-validator");
const { API_STATUS_CODE } = require("../../consts/error-status");

const validateOrganizerData = (req, res, next) => {
    const errors = [];
    if (!req.body.companyId) {
        return res.status(API_STATUS_CODE.BAD_REQUEST).send({
            status: "failed",
            message: "Company ID is required",
        });
    }
    const organizerData = {
        companyId: req.body.companyId,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
        contact: req.body.contact,
        position: req.body.position,
        role: req.body.role,
        profileImg: req.body.profileImg,
    };

    if (!isValidUserFirstName(organizerData.firstName)) {
        errors.push("Invalid user first name");
    }

    if (!isValidUserLastName(organizerData.lastName)) {
        errors.push("Invalid user last name");
    }

    if (!isValidEmail(organizerData.email)) {
        errors.push("Invalid user email address");
    }

    if (!isValidUserContact(organizerData.contact)) {
        errors.push("Invalid user contact number");
    }

    if (!isValidUserPosition(organizerData.position)) {
        errors.push("Invalid user position");
    }

    if (!isValidUserRole(organizerData.role)) {
        errors.push("Invalid user role");
    }

    if (!isValidPassword(organizerData.password)) {
        errors.push("Invalid user password");
    }

    if (errors.length > 0) {
        return res.status(API_STATUS_CODE.BAD_REQUEST).send({
            status: "failed",
            message: errors,
        });
    }
    req.body.organizerData = organizerData;
    next();
};

module.exports = {
    validateOrganizerData,
};
