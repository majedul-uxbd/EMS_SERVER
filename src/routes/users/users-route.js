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

const { loginUserValidation } = require('../../middelwares/user/login-data-validator');
const { userLogin } = require('../../main/user/user-login');
const { getUserData } = require('../../main/user/get-user-data');
const { API_STATUS_CODE } = require('../../consts/error-status');
const authenticateToken = require('../../middelwares/jwt');
const { validateUserData } = require('../../middelwares/user/user-data-validator');
const { addUser } = require('../../main/user/add-user');
const { checkUserIdValidity } = require('../../middelwares/check-user-id-validity');
const { updateUserDataValidator } = require('../../middelwares/user/update-user-data-validator');
const { isUserRoleAdminOrExhibitorAdmin } = require('../../common/utilities/check-user-role');
const { updatePersonalInfo } = require('../../main/user/update-personal-data');
const { deletePersonalData } = require('../../main/user/delete-personal-data');

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

usersRouter.post(
	'/add',
	authenticateToken,
	isUserRoleAdminOrExhibitorAdmin,
	validateUserData,
	async (req, res) => {
		// console.log("🚀 ~ req.body.user:", req.body.user)
		addUser(req.body.user)
			.then((data) => {
				return res.status(API_STATUS_CODE.ACCEPTED).send({
					status: 'success',
					message: 'User created successfully',
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

usersRouter.post('/update',
	authenticateToken,
	checkUserIdValidity,
	updateUserDataValidator,
	async (req, res) => {
		updatePersonalInfo(req.body.user, req.body.userData)
			.then(data => {
				return res.status(API_STATUS_CODE.OK).send({
					status: 'success',
					message: "User updated successfully"
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
