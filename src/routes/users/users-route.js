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
const { API_STATUS_CODE } = require('../../consts/error-status');
const authenticateToken = require('../../middlewares/jwt');
const { checkUserIdValidity } = require('../../middlewares/check-user-id-validity');
const { updateUserDataValidator } = require('../../middlewares/user/update-user-data-validator');
const { updatePersonalInfo } = require('../../main/user/update-personal-data');
const { deletePersonalData } = require('../../main/user/delete-personal-data');


/**
 * Through this API, user can login into the system
 */
usersRouter.post(
	'/user-login',
	loginUserValidation,
	async (req, res) => {
		userLogin(req.body.user)
			.then((data) => {
				return res.status(API_STATUS_CODE.OK).send({
					status: 'success',
					message: 'user-logged in-successfully',
					...data,
				});
			})
			.catch((error) => {
				const { statusCode, message } = error;
				return res.status(statusCode).send({
					status: 'failed',
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
usersRouter.get(
	'/get-my-user-data',
	authenticateToken,
	async (req, res) => {
		getUserData(req.auth)
			.then((data) => {
				return res.status(API_STATUS_CODE.OK).send({
					status: 'success',
					message: 'user-data-fetched-successfully',
					...data,
				});
			})
			.catch((error) => {
				const { statusCode, message } = error;
				return res.status(statusCode).send({
					status: 'failed',
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
	checkUserIdValidity,
	updateUserDataValidator,
	async (req, res) => {
		updatePersonalInfo(req.body.user, req.auth)
			.then(data => {
				return res.status(API_STATUS_CODE.OK).send({
					status: data.status,
					message: data.message
				})
			})
			.catch(error => {
				const { statusCode, message } = error;
				return res.status(statusCode).send({
					status: 'failed',
					message: message,
				})
			})
	}
);


usersRouter.post('/delete',
	authenticateToken,
	checkUserIdValidity,
	async (req, res) => {
		deletePersonalData(req.auth)
			.then(data => {
				return res.status(API_STATUS_CODE.CREATED).send({
					status: 'success',
					message: "User deleted successfully"
				})
			})
			.catch(error => {
				const { statusCode, message } = error;
				return res.status(statusCode).send({
					status: 'failed',
					message: message,
				})
			})
	});

module.exports = {
	usersRouter,
};
