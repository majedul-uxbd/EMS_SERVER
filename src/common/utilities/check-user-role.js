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
  VISITOR: "visitor",
});

/**
 *This function will check whether the user role is System Admin or not
 */
const isUserRoleAdmin = (req, res, next) => {
  const userData = req.auth;
  if (userData.role === userRole.SYSTEM_ADMIN) {
    next();
  } else {
    return res.status(API_STATUS_CODE.NOT_ACCEPTABLE).send({
      status: "failed",
      message: "User role is not allowed for the request",
    });
  }
};

/**
 *This function will check if the user role is Exhibitor Admin or Exhibitor
 */
const isUserRoleExhibitorAdminOrExhibitor = (req, res, next) => {
  const userData = req.auth;
  if (
    userData.role === userRole.EXHIBITOR_ADMIN ||
    userData.role === userRole.EXHIBITOR
  ) {
    next();
  } else {
    return res.status(API_STATUS_CODE.NOT_ACCEPTABLE).send({
      status: "failed",
      message: "User role is not allowed for the request",
    });
  }
};

/**
 *This function will check whether the user role is Exhibitor Admin or not
 */
const isUserRoleExhibitorAdmin = (req, res, next) => {
  const userData = req.auth;
  if (userData.role === userRole.EXHIBITOR_ADMIN) {
    next();
  } else {
    return res.status(API_STATUS_CODE.NOT_ACCEPTABLE).send({
      status: "failed",
      message: "User role is not allowed for the request",
    });
  }
};

/**
 *This function will check whether the user role is Exhibitor or not
 */
const isUserRoleExhibitor = (req, res, next) => {
  const userData = req.auth;
  if (userData.role === userRole.EXHIBITOR) {
    next();
  } else {
    return res.status(API_STATUS_CODE.NOT_ACCEPTABLE).send({
      status: "failed",
      message: "User role is not allowed for the request",
    });
  }
};

/**
 *This function will check whether the user role is Visitor or not
 */
const isUserRoleVisitor = (req, res, next) => {
  const userData = req.auth;
  if (userData.role === userRole.VISITOR) {
    next();
  } else {
    return res.status(API_STATUS_CODE.NOT_ACCEPTABLE).send({
      status: "failed",
      message: "User role is not allowed for the request",
    });
  }
};

/**
 *This function will check if the user role is System Admin or Organizer
 */
const isUserRoleAdminOrOrganizer = (req, res, next) => {
  const userData = req.auth;
  if (
    userData.role === userRole.SYSTEM_ADMIN ||
    userData.role === userRole.ORGANIZER
  ) {
    next();
  } else {
    return res.status(API_STATUS_CODE.NOT_ACCEPTABLE).send({
      status: "failed",
      message: "User role is not allowed for the request",
    });
  }
};

/**
 *This function will check if the user role is System Admin or Exhibitor Admin
 */
const isUserRoleAdminOrExhibitorAdmin = (req, res, next) => {
  const userData = req.auth;
  if (
    userData.role === userRole.SYSTEM_ADMIN ||
    userData.role === userRole.EXHIBITOR_ADMIN
  ) {
    next();
  } else {
    return res.status(API_STATUS_CODE.NOT_ACCEPTABLE).send({
      status: "failed",
      message: "User role is not allowed for the request",
    });
  }
};

/**
 *This function will check if the user role is System Admin or Visitor
 */
const isUserRoleAdminOrVisitor = (req, res, next) => {
  const userData = req.auth;
  if (
    userData.role === userRole.SYSTEM_ADMIN ||
    userData.role === userRole.VISITOR
  ) {
    next();
  } else {
    return res.status(API_STATUS_CODE.NOT_ACCEPTABLE).send({
      status: "failed",
      message: "User role is not allowed for the request",
    });
  }
};

/**
 *This function will check if the user role is System Admin or Exhibitor Admin or Exhibitor
 */
const isUserRoleAdminOrExhibitorAdminOrExhibitor = (req, res, next) => {
  const userData = req.auth;
  if (
    userData.role === userRole.SYSTEM_ADMIN ||
    userData.role === userRole.EXHIBITOR_ADMIN ||
    userData.role === userRole.EXHIBITOR
  ) {
    next();
  } else {
    return res.status(API_STATUS_CODE.NOT_ACCEPTABLE).send({
      status: "failed",
      message: "User role is not allowed for the request",
    });
  }
};

/**
 *This function will check if the user role is Exhibitor Admin or Exhibitor
 */
const isUserRoleExhibitorAdminOrExhibitorOrVisitor = (req, res, next) => {
  const userData = req.auth;
  if (
    userData.role === userRole.EXHIBITOR_ADMIN ||
    userData.role === userRole.EXHIBITOR ||
    userData.role === userRole.VISITOR
  ) {
    next();
  } else {
    return res.status(API_STATUS_CODE.NOT_ACCEPTABLE).send({
      status: "failed",
      message: "User role is not allowed for the request",
    });
  }
};

module.exports = {
  isUserRoleAdmin,
  isUserRoleExhibitorAdminOrExhibitor,
  isUserRoleExhibitorAdmin,
  isUserRoleExhibitor,
  isUserRoleVisitor,
  isUserRoleAdminOrOrganizer,
  isUserRoleAdminOrExhibitorAdmin,
  isUserRoleAdminOrVisitor,
  isUserRoleAdminOrExhibitorAdminOrExhibitor,
  isUserRoleExhibitorAdminOrExhibitorOrVisitor,
};
