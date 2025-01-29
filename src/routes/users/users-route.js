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

const express = require('express');
const usersRouter = express.Router();

const { loginUserValidation } = require('../../middlewares/user/login-data-validator');
const { userLogin } = require('../../main/user/user-login');
const { getUserData } = require('../../main/user/get-user-data');
const authenticateToken = require('../../middlewares/jwt');
const { updateUserDataValidator } = require('../../middlewares/user/update-user-data-validator');
const { updatePersonalInfo } = require('../../main/user/update-personal-data');
const { isUserRoleAdmin } = require('../../common/utilities/check-user-role');
const { deleteVisitorData } = require('../../main/user/delete-visitor-data');


/**
 * Through this API, user can login into the system
 */
usersRouter.post(
	'/user-login',
	loginUserValidation,
	async (req, res) => {
		userLogin(req.body.user)
			.then((data) => {
				const { statusCode, status, message, result } = data;
				return res.status(statusCode).send({
					status: status,
					message: message,
					token: result.token,
					user: result

				});
			})
			.catch((error) => {
				const { statusCode, status, message } = error;
				return res.status(statusCode).send({
					status: status,
					message: message,
				});
			});
	}
);

/**
 * This API will create a new user
 */
// usersRouter.post(
// 	'/add',
// 	authenticateToken,
// 	isUserRoleAdminOrExhibitorAdmin,
// 	validateUserData,
// 	async (req, res) => {

// 		addUser(req.body.user)
// 			.then((data) => {
// 				return res.status(API_STATUS_CODE.ACCEPTED).send({
// 					status: data.status,
// 					message: data.message,
// 				});
// 			})
// 			.catch((error) => {
// 				const { statusCode, message } = error;
// 				return res.status(statusCode).send({
// 					status: 'failed',
// 					message: message,
// 				});
// 			});
// 	}
// );

/**
 * This API will get user and visitor own data
 */
usersRouter.post(
	'/get-my-user-data',
	authenticateToken,
	async (req, res) => {
		getUserData(req.auth, req.body)
			.then((data) => {
				const { statusCode, status, message, result } = data;
				return res.status(statusCode).send({
					status: status,
					message: message,
					user: result
				});
			})
			.catch((error) => {
				const { statusCode, status, message } = error;
				return res.status(statusCode).send({
					status: status,
					message: message,
				});
			});
	}
);

/**
 * This API will update user and visitor own data
 */
usersRouter.post('/update',
	authenticateToken,
	updateUserDataValidator,
	async (req, res) => {
		updatePersonalInfo(req.body.user, req.auth)
			.then((data) => {
				const { statusCode, status, message, result } = data;
				return res.status(statusCode).send({
					status: status,
					message: message,
					data: result
				});
			})
			.catch((error) => {
				const { statusCode, status, message } = error;
				return res.status(statusCode).send({
					status: status,
					message: message,
				});
			});
	}
);


usersRouter.post('/delete',
	authenticateToken,
	isUserRoleAdmin,
	async (req, res) => {
		deleteVisitorData(req.body)
			.then((data) => {
				const { statusCode, status, message } = data;
				return res.status(statusCode).send({
					status: status,
					message: message
				});
			})
			.catch((error) => {
				const { statusCode, status, message } = error;
				return res.status(statusCode).send({
					status: status,
					message: message,
				});
			});
	});

module.exports = {
	usersRouter,
};
