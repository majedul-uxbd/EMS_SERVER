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
const { setServerResponse } = require("../set-server-response");

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
	const lgKey = req.body.lg;
	if (userData.role === userRole.SYSTEM_ADMIN) {
		next();
	} else {
		return res.status(API_STATUS_CODE.NOT_ACCEPTABLE).send(
			setServerResponse(
				API_STATUS_CODE.NOT_ACCEPTABLE,
				'user_role_is_not_allowed_for_the_request',
				lgKey,
			)
		);
	}
};

/**
 *This function will check if the user role is Exhibitor Admin or Exhibitor
 */
const isUserRoleExhibitorAdminOrExhibitor = (req, res, next) => {
	const userData = req.auth;
	const lgKey = req.body.lg;

	if (
		userData.role === userRole.EXHIBITOR_ADMIN ||
		userData.role === userRole.EXHIBITOR
	) {
		next();
	} else {
		return res.status(API_STATUS_CODE.NOT_ACCEPTABLE).send(
			setServerResponse(
				API_STATUS_CODE.NOT_ACCEPTABLE,
				'user_role_is_not_allowed_for_the_request',
				lgKey,
			)
		);
	}
};

/**
 *This function will check whether the user role is Exhibitor Admin or not
 */
const isUserRoleExhibitorAdmin = (req, res, next) => {
	const userData = req.auth;
	const lgKey = req.body.lg;

	if (userData.role === userRole.EXHIBITOR_ADMIN) {
		next();
	} else {
		return res.status(API_STATUS_CODE.NOT_ACCEPTABLE).send(
			setServerResponse(
				API_STATUS_CODE.NOT_ACCEPTABLE,
				'user_role_is_not_allowed_for_the_request',
				lgKey,
			)
		);
	}
};

/**
 *This function will check whether the user role is Organizer or not
 */
const isUserRoleOrganizer = (req, res, next) => {
	const userData = req.auth;
	const lgKey = req.body.lg;

	if (userData.role === userRole.ORGANIZER) {
		next();
	} else {
		return res.status(API_STATUS_CODE.NOT_ACCEPTABLE).send(
			setServerResponse(
				API_STATUS_CODE.NOT_ACCEPTABLE,
				'user_role_is_not_allowed_for_the_request',
				lgKey,
			)
		);
	}
};

/**
 *This function will check whether the user role is Exhibitor or not
 */
const isUserRoleExhibitor = (req, res, next) => {
	const userData = req.auth;
	const lgKey = req.body.lg;

	if (userData.role === userRole.EXHIBITOR) {
		next();
	} else {
		return res.status(API_STATUS_CODE.NOT_ACCEPTABLE).send(
			setServerResponse(
				API_STATUS_CODE.NOT_ACCEPTABLE,
				'user_role_is_not_allowed_for_the_request',
				lgKey,
			)
		);
	}
};

/**
 *This function will check whether the user role is Visitor or not
 */
const isUserRoleVisitor = (req, res, next) => {
	const userData = req.auth;
	const lgKey = req.body.lg;

	if (userData.role === userRole.VISITOR) {
		next();
	} else {
		return res.status(API_STATUS_CODE.NOT_ACCEPTABLE).send(
			setServerResponse(
				API_STATUS_CODE.NOT_ACCEPTABLE,
				'user_role_is_not_allowed_for_the_request',
				lgKey,
			)
		);
	}
};

/**
 *This function will check if the user role is Visitor or exhibitor
 */
const isUserRoleExhibitorOrVisitor = (req, res, next) => {
	const userData = req.auth;
	const lgKey = req.body.lg;

	if (userData.role === userRole.VISITOR || userData.role === userRole.EXHIBITOR || userData.role === userRole.EXHIBITOR_ADMIN) {
		next();
	} else {
		return res.status(API_STATUS_CODE.NOT_ACCEPTABLE).send(
			setServerResponse(
				API_STATUS_CODE.NOT_ACCEPTABLE,
				'user_role_is_not_allowed_for_the_request',
				lgKey,
			)
		);
	}
};

/**
 *This function will check if the user role is System Admin or Organizer
 */
const isUserRoleAdminOrOrganizer = (req, res, next) => {
	const userData = req.auth;
	const lgKey = req.body.lg;

	if (
		userData.role === userRole.SYSTEM_ADMIN ||
		userData.role === userRole.ORGANIZER
	) {
		next();
	} else {
		return res.status(API_STATUS_CODE.NOT_ACCEPTABLE).send(
			setServerResponse(
				API_STATUS_CODE.NOT_ACCEPTABLE,
				'user_role_is_not_allowed_for_the_request',
				lgKey,
			)
		);
	}
};

/**
 *This function will check if the user role is System Admin or Exhibitor Admin
 */
const isUserRoleAdminOrExhibitorAdmin = (req, res, next) => {
	const userData = req.auth;
	const lgKey = req.body.lg;

	if (
		userData.role === userRole.SYSTEM_ADMIN ||
		userData.role === userRole.EXHIBITOR_ADMIN
	) {
		next();
	} else {
		return res.status(API_STATUS_CODE.NOT_ACCEPTABLE).send(
			setServerResponse(
				API_STATUS_CODE.NOT_ACCEPTABLE,
				'user_role_is_not_allowed_for_the_request',
				lgKey,
			)
		);
	}
};

/**
 *This function will check if the user role is System Admin or Visitor
 */
const isUserRoleAdminOrVisitor = (req, res, next) => {
	const userData = req.auth;
	const lgKey = req.body.lg;

	if (
		userData.role === userRole.SYSTEM_ADMIN ||
		userData.role === userRole.VISITOR
	) {
		next();
	} else {
		return res.status(API_STATUS_CODE.NOT_ACCEPTABLE).send(
			setServerResponse(
				API_STATUS_CODE.NOT_ACCEPTABLE,
				'user_role_is_not_allowed_for_the_request',
				lgKey,
			)
		);
	}
};

/**
 *This function will check if the user role is System Admin or Exhibitor Admin or Exhibitor
 */
const isUserRoleAdminOrExhibitorAdminOrExhibitor = (req, res, next) => {
	const userData = req.auth;
	const lgKey = req.body.lg;

	if (
		userData.role === userRole.SYSTEM_ADMIN ||
		userData.role === userRole.EXHIBITOR_ADMIN ||
		userData.role === userRole.EXHIBITOR
	) {
		next();
	} else {
		return res.status(API_STATUS_CODE.NOT_ACCEPTABLE).send(
			setServerResponse(
				API_STATUS_CODE.NOT_ACCEPTABLE,
				'user_role_is_not_allowed_for_the_request',
				lgKey,
			)
		);
	}
};

/**
 *This function will check if the user role is Exhibitor Admin or Exhibitor or visitor
 */
const isUserRoleExhibitorAdminOrExhibitorOrVisitor = (req, res, next) => {
	const userData = req.auth;
	const lgKey = req.body.lg;

	if (
		userData.role === userRole.EXHIBITOR_ADMIN ||
		userData.role === userRole.EXHIBITOR ||
		userData.role === userRole.VISITOR
	) {
		next();
	} else {
		return res.status(API_STATUS_CODE.NOT_ACCEPTABLE).send(
			setServerResponse(
				API_STATUS_CODE.NOT_ACCEPTABLE,
				'user_role_is_not_allowed_for_the_request',
				lgKey,
			)
		);
	}
};


/**
 *This function will check if the user role is Organizer or Exhibitor or visitor
 */
const isUserRoleOrganizerOrExhibitorOrVisitor = (req, res, next) => {
	const userData = req.auth;
	const lgKey = req.body.lg;

	if (
		userData.role === userRole.ORGANIZER ||
		userData.role === userRole.EXHIBITOR_ADMIN ||
		userData.role === userRole.EXHIBITOR ||
		userData.role === userRole.VISITOR
	) {
		next();
	} else {
		return res.status(API_STATUS_CODE.NOT_ACCEPTABLE).send(
			setServerResponse(
				API_STATUS_CODE.NOT_ACCEPTABLE,
				'user_role_is_not_allowed_for_the_request',
				lgKey,
			)
		);
	}
};

module.exports = {
	isUserRoleAdmin,
	isUserRoleExhibitorAdminOrExhibitor,
	isUserRoleExhibitorAdmin,
	isUserRoleOrganizer,
	isUserRoleExhibitor,
	isUserRoleVisitor,
	isUserRoleExhibitorOrVisitor,
	isUserRoleAdminOrOrganizer,
	isUserRoleAdminOrExhibitorAdmin,
	isUserRoleAdminOrVisitor,
	isUserRoleAdminOrExhibitorAdminOrExhibitor,
	isUserRoleExhibitorAdminOrExhibitorOrVisitor,
	isUserRoleOrganizerOrExhibitorOrVisitor
};
