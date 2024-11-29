const express = require("express");
const attendanceRouter = express.Router();

const authenticateToken = require("../../middlewares/jwt");
const { isUserRoleAdminOrOrganizer } = require("../../common/utilities/check-user-role");
const { createAttendanceData } = require("../../main/attendance/create-attendance");
const { getAllAttendanceData } = require("../../main/attendance/get-all-attendance");
const { API_STATUS_CODE } = require("../../consts/error-status");
const { paginationData } = require("../../middlewares/common/pagination-data");
const { fetchAttendanceData, generateAttendancePDF } = require("../../main/attendance/pdf-attendance")
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

attendanceRouter.post(
	"/generate_attendance_pdf",
	authenticateToken,

	async (req, res) => {
		const { id, lg } = req.body;

		if (!id) {
			return res.status(API_STATUS_CODE.BAD_REQUEST).send({
				status: "failed",
				message: "Exhibition ID is required in the request body.",
			});
		}

		try {
			// Fetch attendance data based on the exhibition ID
			const attendanceData = await fetchAttendanceData(id);

			if (attendanceData.length === 0) {
				return res.status(API_STATUS_CODE.NOT_FOUND).send({
					status: "failed",
					message: "No attendance data found for the given exhibition ID.",
				});
			}

			// Generate the PDF from the fetched data
			const pdfBuffer = await generateAttendancePDF(attendanceData, lg);

			// Set the response headers for the PDF
			res.setHeader("Content-Type", "application/pdf");
			res.setHeader("Content-Disposition", "inline; filename=Attendance_Report.pdf");

			// Send the PDF buffer as the response
			return res.status(API_STATUS_CODE.OK).send(pdfBuffer);
		} catch (error) {
			console.error("Error generating attendance PDF:", error);
			const { statusCode = API_STATUS_CODE.INTERNAL_SERVER_ERROR, message = "Internal server error" } = error;

			return res.status(statusCode).send({
				status: "failed",
				message,
			});
		}
	}
);

module.exports = {
	attendanceRouter,
};
