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
    isValidUserRole,
    isValidPassword,
} = require("../../common/user-data-validator");
const { API_STATUS_CODE } = require("../../consts/error-status");

const validateUserData = (req, res, next) => {
    const errors = [];
    if (!req.body.companyId) {
        return res.status(API_STATUS_CODE.BAD_REQUEST).send({
            status: "failed",
            message: "Company ID is required",
        });
    }
    const user = {
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

    if (!isValidUserFirstName(user.firstName)) {
        errors.push("Invalid user first name");
    }

    if (!isValidUserLastName(user.lastName)) {
        errors.push("Invalid user last name");
    }

    if (!isValidEmail(user.email)) {
        errors.push("Invalid user email address");
    }

    if (!isValidUserContact(user.contact)) {
        errors.push("Invalid user contact number");
    }

    if (!isValidUserPosition(user.position)) {
        errors.push("Invalid user position");
    }

    if (!isValidUserRole(user.role)) {
        errors.push("Invalid user role");
    }

    if (!isValidPassword(user.password)) {
        errors.push("Invalid user password");
    }
    // console.log("🚀 ~ validateAddUserData ~ errors:", errors)

    if (errors.length > 0) {
        return res.status(API_STATUS_CODE.BAD_REQUEST).send({
            status: "failed",
            message: errors,
        });
    }
    // console.log("🚀 ~ validateAddUserData ~ user:", user)
    req.body.user = user;
    next();
};

module.exports = {
    validateUserData,
};
