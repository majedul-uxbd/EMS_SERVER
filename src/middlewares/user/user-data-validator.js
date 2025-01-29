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
    isValidUserRole,
} = require("../../common/user-data-validator");
const { API_STATUS_CODE } = require("../../consts/error-status");

/**
 * @description This function is used to validate user data
 */
const validateUserData = (req, res, next) => {
    const lgKey = req.body.lg;
    if (!req.body.companyId) {
        return res.status(API_STATUS_CODE.BAD_REQUEST).send(
            setServerResponse(
                API_STATUS_CODE.BAD_REQUEST,
                'company_id_is_required',
                lgKey,
            )
        );
    }
    const user = {
        lg: req.body.lg,
        companyId: req.body.companyId,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        contact: req.body.contact,
        position: req.body.position,
        role: req.body.role,
        profileImg: req.body.profileImg,
    };

    if (!isValidUserFirstName(user.firstName)) {
        return res.status(API_STATUS_CODE.BAD_REQUEST).send(
            setServerResponse(
                API_STATUS_CODE.BAD_REQUEST,
                'invalid_user_first_name',
                lgKey
            )
        );
    }

    if (!isValidUserLastName(user.lastName)) {
        return res.status(API_STATUS_CODE.BAD_REQUEST).send(
            setServerResponse(
                API_STATUS_CODE.BAD_REQUEST,
                'invalid_user_last_name',
                lgKey
            )
        );
    }

    if (!isValidEmail(user.email)) {
        return res.status(API_STATUS_CODE.BAD_REQUEST).send(
            setServerResponse(
                API_STATUS_CODE.BAD_REQUEST,
                'invalid_user_email_address',
                lgKey
            )
        );
    }

    if (!isValidUserContact(user.contact)) {
        return res.status(API_STATUS_CODE.BAD_REQUEST).send(
            setServerResponse(
                API_STATUS_CODE.BAD_REQUEST,
                'invalid_user_contact_number',
                lgKey
            )
        );
    }

    if (!isValidUserPosition(user.position)) {
        return res.status(API_STATUS_CODE.BAD_REQUEST).send(
            setServerResponse(
                API_STATUS_CODE.BAD_REQUEST,
                'invalid_user_position',
                lgKey
            )
        );
    }

    if (!isValidUserRole(user.role)) {
        return res.status(API_STATUS_CODE.BAD_REQUEST).send(
            setServerResponse(
                API_STATUS_CODE.BAD_REQUEST,
                'invalid_user_role',
                lgKey
            )
        );
    }

    // console.log("🚀 ~ validateAddUserData ~ user:", user)
    req.body.user = user;
    next();
};

module.exports = {
    validateUserData,
};
