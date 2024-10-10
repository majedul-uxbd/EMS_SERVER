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

const { API_STATUS_CODE } = require("../../consts/error-status");


const userRole = Object.freeze({
    SYSTEM_ADMIN: "system_admin",
    EXHIBITOR_ADMIN: "exhibitor_admin",
    EXHIBITOR: "exhibitor",
    ORGANIZER: "organizer",
    VISITOR: "visitor"
});


const isUserRoleAdmin = (req, res, next) => {
    const userData = req.auth;
    if (userData.role === userRole.SYSTEM_ADMIN) {
        next();
    } else {
        return res.status(API_STATUS_CODE.NOT_ACCEPTABLE).send({
            status: "failed",
            message: 'User role is not allowed for the request',
        });
    }
}

const isUserRoleExhibitorAdminOrExhibitor = (req, res, next) => {
    const userData = req.auth;
    if (userData.role === userRole.EXHIBITOR_ADMIN || userData.role === userRole.EXHIBITOR) {
        next();
    } else {
        return res.status(API_STATUS_CODE.NOT_ACCEPTABLE).send({
            status: "failed",
            message: 'User role is not allowed for the request',
        });
    }
}

const isUserRoleExhibitor = (req, res, next) => {
    const userData = req.auth;
    if (userData.role === userRole.EXHIBITOR) {
        next();
    } else {
        return res.status(API_STATUS_CODE.NOT_ACCEPTABLE).send({
            status: "failed",
            message: 'User role is not allowed for the request',
        });
    }
}

const isUserRoleVisitor = (req, res, next) => {
    const userData = req.auth;
    if (userData.role === userRole.VISITOR) {
        next();
    } else {
        return res.status(API_STATUS_CODE.NOT_ACCEPTABLE).send({
            status: "failed",
            message: 'User role is not allowed for the request',
        });
    }
}

const isUserRoleAdminOrOrganizer = (req, res, next) => {
    const userData = req.auth;
    if (userData.role !== 'system_admin' || userData.role !== 'organizer') {
        return res.status(API_STATUS_CODE.NOT_ACCEPTABLE).send({
            status: "failed",
            message: 'User role is not allowed for the request',
        });
    }
    next()

}

const isUserRoleAdminOrExhibitorAdmin = (req, res, next) => {
    const userData = req.auth;
    if (userData.role === userRole.SYSTEM_ADMIN || userData.role === userRole.EXHIBITOR_ADMIN) {
        next();
    } else {
        return res.status(API_STATUS_CODE.NOT_ACCEPTABLE).send({
            status: "failed",
            message: 'User role is not allowed for the request',
        });
    }

}

const isUserRoleAdminOrVisitor = (req, res, next) => {
    const userData = req.auth;
    if (userData.role === 'system_admin' || userData.role === 'visitor') {
        next();
    } else {
        return res.status(API_STATUS_CODE.NOT_ACCEPTABLE).send({
            status: "failed",
            message: 'User role is not allowed for the request',
        });
    }
}






module.exports = {
    isUserRoleAdmin,
    isUserRoleExhibitorAdminOrExhibitor,
    isUserRoleExhibitor,
    isUserRoleVisitor,
    isUserRoleAdminOrOrganizer,
    isUserRoleAdminOrExhibitorAdmin,
    isUserRoleAdminOrVisitor
}