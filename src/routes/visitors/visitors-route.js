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
const { checkUserIdValidity } = require("../../middlewares/check-user-id-validity");
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

/**
 * Through this API, visitors can register themselves
 */
visitorsRouter.post("/add",
	validateVisitorData,
	async (req, res) => {
		addVisitor(req.body.visitor)
			.then((data) => {
				return res.status(API_STATUS_CODE.ACCEPTED).send({
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
	});

/**
 * Through this API, visitors can see their information
 */
visitorsRouter.post(
	"/get-my-data",
	authenticateToken,
	isUserRoleVisitor,
	async (req, res) => {
		getVisitorData(req.auth)
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

/**
 * Through this API, visitors can update their information
 */
visitorsRouter.post(
	"/update",
	authenticateToken,
	isUserRoleVisitor,
	checkUserIdValidity,
	updateVisitorDataValidator,
	async (req, res) => {
		updateVisitorData(req.body.visitor, req.auth)
			.then((data) => {
				return res.status(API_STATUS_CODE.OK).send({
					status: "success",
					message: "Visitor Data updated successfully",
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
 * Through this API, visitors will scan projects to request the exhibitor to view the project document
 */
visitorsRouter.post(
	"/scan-project",
	authenticateToken,
	isUserRoleExhibitorAdminOrExhibitorOrVisitor,
	validateScannerBodyData,
	async (req, res) => {
		insertDocumentRequestData(req.auth, req.body.scannerData)
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
 * Through this API, approved visitors can view the project document
 */
visitorsRouter.post(
	"/get-requested-document",
	authenticateToken,
	isUserRoleVisitor,
	paginationData,
	async (req, res) => {
		getRequestedDocumentData(req.auth, req.body.paginationData)
			.then((data) => {
				return res.status(API_STATUS_CODE.OK).send({
					status: "success",
					message: "Get requested data successfully",
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



visitorsRouter.post(
	"/document_titles",
	authenticateToken,
	isUserRoleExhibitorAdminOrExhibitorOrVisitor,
	async (req, res) => {
		const { lg, data } = req.body;

		if (!Array.isArray(data)) {
			return res.status(API_STATUS_CODE.BAD_REQUEST).send({
				status: "failed",
				message: "Data is required and must be an array",
			});
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


module.exports = {
	visitorsRouter,
};
