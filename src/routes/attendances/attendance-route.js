const express = require("express");
const attendanceRouter = express.Router();

const authenticateToken = require("../../middlewares/jwt");
const { isUserRoleAdminOrOrganizer } = require("../../common/utilities/check-user-role");
const { createAttendanceData } = require("../../main/attendance/create-attendance");
const { getAllAttendanceData } = require("../../main/attendance/get-all-attendance");
const { API_STATUS_CODE } = require("../../consts/error-status");
const { paginationData } = require("../../middlewares/common/pagination-data");

attendanceRouter.use(authenticateToken);


/**
 * This API will take attendance of users
 */
attendanceRouter.post(
	"/addAttendance",
	isUserRoleAdminOrOrganizer,
	async (req, res) => {
		createAttendanceData(req.auth, req.body)
			.then((data) => {
				return res.status(API_STATUS_CODE.OK).send({
					status: data.status,
					message: data.message,
				});
			})
			.catch((error) => {
				const { statusCode, message } = error;
				return res.status(statusCode).send({
					status: "failed",
					message: message,
				});
			});
	}
);


/**
 * Through this API Organizer will see all attendance information
 */
attendanceRouter.post(
	"/get-all-attendance",
	isUserRoleAdminOrOrganizer,
	paginationData,
	async (req, res) => {
		getAllAttendanceData(req.body.paginationData)
			.then((data) => {
				return res.status(API_STATUS_CODE.OK).send({
					status: "success",
					message: data.message,
					...data,
				});
			})
			.catch((error) => {
				const { statusCode, message } = error;
				return res.status(statusCode).send({
					status: "failed",
					message: message,
				});
			});
	}
);
module.exports = {
	attendanceRouter,
};
