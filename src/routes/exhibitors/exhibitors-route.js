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

const express = require("express");
const exhibitorsRouter = express.Router();

const { API_STATUS_CODE } = require("../../consts/error-status");
const authenticateToken = require("../../middlewares/jwt");
const {
	isUserRoleExhibitorAdmin,
	isUserRoleExhibitorAdminOrExhibitor,
} = require("../../common/utilities/check-user-role");
const { validateExhibitorsData } = require("../../middlewares/exhibitors/check-exhibitors-data");
const { addExhibitor } = require("../../main/exhibitors/add-exhibitors-data");
const { getExhibitorData } = require("../../main/exhibitors/get-exhibitor-data");
const { updateExhibitorData } = require("../../main/exhibitors/update-exhibitor-own-data-validator");
const { updateExhibitorDataValidator } = require("../../middlewares/exhibitors/update-exhibitor-data-validator");
const { paginationData } = require("../../middlewares/common/pagination-data");
const { deleteExhibitorData } = require("../../main/exhibitors/delete-exhibitor-data");
const { activeExhibitorData } = require("../../main/exhibitors/active-exhibitor-data");
const { updateAllExhibitorData } = require("../../main/exhibitors/update-all-exhibitor-data");
const { approveOrRejectRequest } = require("../../main/exhibitors/approve-or-reject-visitor-request");
const { validateVisitorScannerBodyData } = require("../../middlewares/exhibitors/validate-visitor-scan-data");
const { insertRequestedDocumentData } = require("../../main/exhibitors/insert-requested-document-data");
const { getRequestedVisitorData } = require("../../main/exhibitors/get-requested-visitor-data");
const { generateRequestedVisitorPDF } = require("../../main/exhibitors/create_requested_data-pdf");
const { enrollCompanyInExhibition } = require("../../main/exhibitors/enroll-company-in-exhibitions");
const { getEnrollExhibitionData } = require("../../main/exhibitors/get-enrolled-exhibitions-data");
const fs = require("fs");

exhibitorsRouter.use(authenticateToken);


/**
 * This API will create a new exhibitor
 */
exhibitorsRouter.post(
	'/add',
	// isUserRoleExhibitorAdmin,
	validateExhibitorsData,
	async (req, res) => {

		addExhibitor(req.body.exhibitor, req.auth)
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
	}
);


/**
 * This API will be used to get exhibitors data
 */

exhibitorsRouter.post('/get-exhibitor-data',
	isUserRoleExhibitorAdminOrExhibitor,
	paginationData,
	async (req, res) => {
		getExhibitorData(req.auth, req.body)
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

/**
 * This API will allow Exhibitor Admin to update all exhibitor data
 */
exhibitorsRouter.post(
	"/update-all",
	isUserRoleExhibitorAdmin,
	updateExhibitorDataValidator,
	async (req, res) => {
		updateAllExhibitorData(req.body.exhibitorData, req.auth)
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
	}
);

/**
 * This API will allow Exhibitor to update their own data
 */
exhibitorsRouter.post(
	"/update-personal",
	isUserRoleExhibitorAdminOrExhibitor,
	updateExhibitorDataValidator,
	async (req, res) => {
		updateExhibitorData(req.body.exhibitorData, req.auth)
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
	}
);

/**
 * This API will allow Exhibitor Admin to active de-activated exhibitor
 */
exhibitorsRouter.post("/active",
	isUserRoleExhibitorAdmin,
	async (req, res) => {
		activeExhibitorData(req.auth, req.body)
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

/**
* This API will allow Exhibitor Admin to de-active activated exhibitor
*/
exhibitorsRouter.post(
	"/de-active",
	isUserRoleExhibitorAdmin,
	async (req, res) => {
		deleteExhibitorData(req.auth, req.body)
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
	}
);

/**
 * This API will allow Exhibitor to approve or reject visitor request
 */
exhibitorsRouter.post(
	"/is-approved",
	isUserRoleExhibitorAdminOrExhibitor,
	async (req, res) => {
		approveOrRejectRequest(req.auth, req.body)
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
	}
);

/**
 * Through this API, exhibitor will scan visitor ID and enable to show the project document for the visitor
 */
exhibitorsRouter.post(
	"/scan-visitor",
	authenticateToken,
	isUserRoleExhibitorAdminOrExhibitor,
	validateVisitorScannerBodyData,
	async (req, res) => {
		insertRequestedDocumentData(req.body.scannerData)
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
	}
);

/**
 * Through this API, exhibitors will see those visitor data who are requested for documents
 */
exhibitorsRouter.post(
	"/get-requested-visitor-data",
	authenticateToken,
	isUserRoleExhibitorAdminOrExhibitor,
	paginationData,
	async (req, res) => {
		getRequestedVisitorData(req.auth, req.body, req.body.paginationData)
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


exhibitorsRouter.post(
	"/createPDF-requested-visitor-data",
	authenticateToken,
	isUserRoleExhibitorAdminOrExhibitor,
	async (req, res) => {
		try {
			const data = req.body;
			const pdfFilePath = await generateRequestedVisitorPDF(data);

			// Read the generated PDF file
			const pdfBuffer = await fs.promises.readFile(pdfFilePath);

			// Set response headers for PDF
			res.setHeader('Content-Type', 'application/pdf');
			res.setHeader('Content-Disposition', 'inline; filename=Interested_Visitor_List.pdf');

			// Send the PDF buffer
			res.status(API_STATUS_CODE.OK).send(pdfBuffer);

			// Clean up the temporary file
			try {
				await fs.promises.unlink(pdfFilePath);
			} catch (cleanupError) {
				console.error('Error cleaning up PDF file:', cleanupError);
			}
		} catch (error) {
			console.error("Error generating PDF report:", error);
			res.status(error.statusCode || API_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
				status: "failed",
				message: error.message || "Failed to generate PDF report",
			});
		}
	}
);

/**
 * Through this API, exhibitor admin will enroll his company in an exhibition
 */
exhibitorsRouter.post(
	"/enroll-company",
	authenticateToken,
	isUserRoleExhibitorAdmin,
	async (req, res) => {
		enrollCompanyInExhibition(req.auth, req.body)
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
	}
);


/**
 * Through this API, exhibitor admin will see the list of enrolled exhibition
 */
exhibitorsRouter.post(
	"/get-enrolled-exhibition",
	authenticateToken,
	isUserRoleExhibitorAdminOrExhibitor,
	async (req, res) => {
		getEnrollExhibitionData(req.auth, req.body)
			.then((data) => {
				const { statusCode, status, message, result } = data;
				return res.status(statusCode).send({
					status: status,
					message: message,
					exhibitionData: result
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


module.exports = {
	exhibitorsRouter,
};
