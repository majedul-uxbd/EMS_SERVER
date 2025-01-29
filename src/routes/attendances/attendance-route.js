const express = require("express");
const attendanceRouter = express.Router();

const authenticateToken = require("../../middlewares/jwt");
const { isUserRoleAdminOrOrganizer } = require("../../common/utilities/check-user-role");
const { createAttendanceData } = require("../../main/attendance/create-attendance");
const { getAllAttendanceData } = require("../../main/attendance/get-all-attendance");
const { API_STATUS_CODE } = require("../../consts/error-status");
const { paginationData } = require("../../middlewares/common/pagination-data");
const { fetchAttendanceData, generateAttendancePDF } = require("../../main/attendance/pdf-attendance");
const { setServerResponse } = require("../../common/set-server-response");
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
				const { statusCode, status, message } = data;
				return res.status(statusCode).send({
					status: status,
					message: message,
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
 * Through this API Organizer will see all attendance information
 */
attendanceRouter.post(
	"/get-all-attendance",
	isUserRoleAdminOrOrganizer,
	paginationData,
	async (req, res) => {
		getAllAttendanceData(req.auth, req.body, req.body.paginationData)
			.then((data) => {
				const { statusCode, status, message, result } = data;
				return res.status(statusCode).send({
					status: status,
					message: message,
					...result
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

attendanceRouter.post(
	"/generate_attendance_pdf",
	authenticateToken,
	async (req, res) => {
		const { id, lg } = req.body;

		if (!id) {
			return res.status(API_STATUS_CODE.BAD_REQUEST).send(
				setServerResponse(
					API_STATUS_CODE.BAD_REQUEST,
					'exhibition_id_is_required',
					lg
				)
			);
		}

		try {
			// Fetch attendance data based on the exhibition ID
			const attendanceData = await fetchAttendanceData(id);

			if (attendanceData.length === 0) {
				return res.status(API_STATUS_CODE.BAD_REQUEST).send(
					setServerResponse(
						API_STATUS_CODE.BAD_REQUEST,
						'attendance_data_is_not_found_for_the_exhibition',
						lg
					)
				);
			}

			// Generate the PDF from the fetched data
			const pdfBuffer = await generateAttendancePDF(attendanceData, lg);

			// Set the response headers for the PDF
			res.setHeader("Content-Type", "application/pdf");
			res.setHeader("Content-Disposition", "inline; filename=Attendance_Report.pdf");

			// Send the PDF buffer as the response
			return res.status(API_STATUS_CODE.OK).send(pdfBuffer);
		} catch (error) {
			// console.log('🚀 ~ file: attendance-route.js:109 ~ error:', error);
			return res.status(API_STATUS_CODE.INTERNAL_SERVER_ERROR).send(
				setServerResponse(
					API_STATUS_CODE.INTERNAL_SERVER_ERROR,
					'internal_server_error',
					lg,
				)
			);
		}
	}
);

module.exports = {
	attendanceRouter,
};
