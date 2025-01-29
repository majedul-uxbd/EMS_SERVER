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
const visitorsRouter = express.Router();
const { API_STATUS_CODE } = require("../../consts/error-status");
const authenticateToken = require("../../middlewares/jwt");
const { isUserRoleVisitor, isUserRoleExhibitorAdminOrExhibitorOrVisitor } = require("../../common/utilities/check-user-role");
const { validateVisitorData } = require("../../middlewares/visitors/check-visitor-data");
const { addVisitor } = require("../../main/visitor/add-visitors-data");
const { getVisitorData } = require("../../main/visitor/get-my-visitor-data");
const { updateVisitorDataValidator } = require("../../middlewares/visitors/update-visitor-data-validator");
const { updateVisitorData } = require("../../main/visitor/update-visitor-data");
const { validateScannerBodyData } = require("../../middlewares/visitors/check-scanner-body-data");
const { insertDocumentRequestData } = require("../../main/visitor/insert-document-request-data");
const { getRequestedDocumentData } = require("../../main/document/get-requested-document-data");
const { generatePDFReport } = require("../../main/document/visitors_document-list");
const { paginationData } = require("../../middlewares/common/pagination-data");
const { enrollVisitorInExhibition } = require("../../main/visitor/enroll-visitor-in-exhibition");
const { setServerResponse } = require("../../common/set-server-response");

/**
 * Through this API, visitors can register themselves
 */
visitorsRouter.post("/add",
	validateVisitorData,
	async (req, res) => {
		addVisitor(req.body.visitor)
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
 * Through this API, visitors can see their information
 */
visitorsRouter.post(
	"/get-my-data",
	authenticateToken,
	isUserRoleVisitor,
	async (req, res) => {
		getVisitorData(req.auth, req.body)
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

/**
 * Through this API, visitors can update their information
 */
visitorsRouter.post(
	"/update",
	authenticateToken,
	isUserRoleVisitor,
	updateVisitorDataValidator,
	async (req, res) => {
		updateVisitorData(req.body.visitor, req.auth)
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
 * Through this API, visitors will scan projects to request the exhibitor to view the project document
 */
visitorsRouter.post(
	"/scan-project",
	authenticateToken,
	isUserRoleVisitor,
	validateScannerBodyData,
	async (req, res) => {
		insertDocumentRequestData(req.auth, req.body.scannerData)
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
 * Through this API, approved visitors can view the project document
 */
visitorsRouter.post(
	"/get-requested-document",
	authenticateToken,
	isUserRoleVisitor,
	paginationData,
	async (req, res) => {
		getRequestedDocumentData(req.auth, req.body, req.body.paginationData)
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



visitorsRouter.post(
	"/document_titles",
	authenticateToken,
	isUserRoleExhibitorAdminOrExhibitorOrVisitor,
	async (req, res) => {
		const { lg, data } = req.body;

		if (!Array.isArray(data)) {
			return res.status(API_STATUS_CODE.BAD_REQUEST).send(
				setServerResponse(
					API_STATUS_CODE.BAD_REQUEST,
					'data_is_required_and_must_be_an_array',
					lg
				)
			);
		}

		try {
			const pdfBuffer = await generatePDFReport(data, lg);

			// Set response headers for PDF
			res.setHeader('Content-Type', 'application/pdf');
			res.setHeader('Content-Disposition', 'inline; filename=List_of_Requested_Documents.pdf');

			// Send the PDF buffer directly
			return res.status(API_STATUS_CODE.OK).send(pdfBuffer);
		} catch (error) {
			const { statusCode, message } = error;
			return res.status(statusCode).send({
				status: "failed",
				message: message,
			});
		}
	}
);


/**
 * Through this API, visitor can enroll in an exhibition
 */
visitorsRouter.post(
	"/enroll-visitor",
	authenticateToken,
	isUserRoleVisitor,
	async (req, res) => {
		enrollVisitorInExhibition(req.auth, req.body)
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


module.exports = {
	visitorsRouter,
};
