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
const reportGenerateRouter = express.Router();

const authenticateToken = require('../../middlewares/jwt');
const { isUserRoleAdmin } = require('../../common/utilities/check-user-role');
const { generateEnrolledVisitorReport } = require('../../main/report-generate/generate-enrolled-visitor-report');
const { API_STATUS_CODE } = require('../../consts/error-status');
const { generateEnrolledOrganizerReport } = require('../../main/report-generate/generate-enrolled-organizer-report');
const { generateEnrolledExhibitorReport } = require('../../main/report-generate/generate-enrolled-exhibitor-report');
const { generateEnrolledCompanyReport } = require('../../main/report-generate/generate-enrolled-company-report');
const { generateEnrolledCompanyProjectReport } = require('../../main/report-generate/generate-enrolled-company-project-report');
const { generateEnrolledUserAttendanceReport } = require('../../main/report-generate/generate-enrolled-user-attendance-report');


reportGenerateRouter.use(authenticateToken);



/**
 * This API will create enrolled Visitor Report
 */
reportGenerateRouter.post(
    '/enrolled-visitor-report',
    isUserRoleAdmin,
    async (req, res) => {

        generateEnrolledVisitorReport(req.body)
            // console.log('🚀 ~ file: report-generate-route.js:33 ~ filePath:', filePath);
            .then((data) => {
                setTimeout(() => {
                    res.download(data, (downloadErr) => {
                        if (downloadErr) {
                            return res.status(API_STATUS_CODE.BAD_REQUEST).send({
                                status: 'failed',
                                message: 'Failed to download report'
                            });
                        }
                    });
                }, 100); // 100 ms = 0.1 seconds
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
 * This API will create a enrolled organizer report
 */
reportGenerateRouter.post(
    '/enrolled-organizer-report',
    isUserRoleAdmin,
    async (req, res) => {

        generateEnrolledOrganizerReport(req.body)
            .then((data) => {
                setTimeout(() => {
                    res.download(data, (downloadErr) => {
                        if (downloadErr) {
                            return res.status(API_STATUS_CODE.BAD_REQUEST).send({
                                status: 'failed',
                                message: 'Failed to download report'
                            });
                        }
                    });
                }, 100); // 100 ms = 0.1 seconds
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
 * This API will create a enrolled exhibitor report
 */
reportGenerateRouter.post(
    '/enrolled-exhibitor-report',
    isUserRoleAdmin,
    async (req, res) => {

        generateEnrolledExhibitorReport(req.body)
            .then((data) => {
                setTimeout(() => {
                    res.download(data, (downloadErr) => {
                        if (downloadErr) {
                            return res.status(API_STATUS_CODE.BAD_REQUEST).send({
                                status: 'failed',
                                message: 'Failed to download report'
                            });
                        }
                    });
                }, 100); // 100 ms = 0.1 seconds
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
 * This API will create a enrolled company report
 */
reportGenerateRouter.post(
    '/enrolled-company-report',
    isUserRoleAdmin,
    async (req, res) => {

        generateEnrolledCompanyReport(req.body)
            .then((data) => {
                setTimeout(() => {
                    res.download(data, (downloadErr) => {
                        if (downloadErr) {
                            return res.status(API_STATUS_CODE.BAD_REQUEST).send({
                                status: 'failed',
                                message: 'Failed to download report'
                            });
                        }
                    });
                }, 100); // 100 ms = 0.1 seconds
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
 * This API will create a enrolled company project's report
 */
reportGenerateRouter.post(
    '/enrolled-company-project-report',
    isUserRoleAdmin,
    async (req, res) => {

        generateEnrolledCompanyProjectReport(req.body)
            .then((data) => {
                setTimeout(() => {
                    res.download(data, (downloadErr) => {
                        if (downloadErr) {
                            return res.status(API_STATUS_CODE.BAD_REQUEST).send({
                                status: 'failed',
                                message: 'Failed to download report'
                            });
                        }
                    });
                }, 100); // 100 ms = 0.1 seconds
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
 * This API will create a enrolled user attendance report
 */
reportGenerateRouter.post(
    '/enrolled-user-attendance-report',
    isUserRoleAdmin,
    async (req, res) => {

        generateEnrolledUserAttendanceReport(req.body)
            .then((data) => {
                setTimeout(() => {
                    res.download(data, (downloadErr) => {
                        if (downloadErr) {
                            return res.status(API_STATUS_CODE.BAD_REQUEST).send({
                                status: 'failed',
                                message: 'Failed to download report'
                            });
                        }
                    });
                }, 100); // 100 ms = 0.1 seconds
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



module.exports = {
    reportGenerateRouter
}