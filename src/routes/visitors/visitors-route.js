/**
 * @author Md. Majedul Islam <https://github.com/majedul-uxbd>
 * Software Engineer,
 * Ultra-X BD Ltd.
 *
 * @copyright All right reserved Majedul
 *
 * @description
 *
 */

const express = require('express');
const visitorsRouter = express.Router();


const { API_STATUS_CODE } = require('../../consts/error-status');
const authenticateToken = require('../../middelwares/jwt');
const { checkUserIdValidity } = require('../../middelwares/check-user-id-validity');
const { isUserRoleVisitor, isUserRoleExhibitorAdminOrExhibitorOrVisitor } = require('../../common/utilities/check-user-role');
const { validateVisitorData } = require('../../middelwares/visitors/check-visitor-data');
const { addVisitor } = require('../../main/visitor/add-visitors-data');
const { getVisitorData } = require('../../main/visitor/get-my-visitor-data');
const { updateVisitorDataValidator } = require('../../middelwares/visitors/update-visitor-data-validator');
const { updateVisitorData } = require('../../main/visitor/update-visitor-data');
const { validateScannerBodyData } = require('../../middelwares/visitors/check-scanner-body-data');
const { insertDocumentRequestData } = require('../../main/visitor/insert-document-request-data');
const { getRequestedDocumentData } = require('../../main/document/get-requested-document-data');
const { paginationData } = require('../../middelwares/common/pagination-data');




visitorsRouter.post(
    '/add',
    // isUserRoleAdminOrVisitor,
    validateVisitorData,
    async (req, res) => {
        // console.log("🚀 ~ req.body.visitor:", req.body.visitor)

        addVisitor(req.body.visitor)
            .then((data) => {
                return res.status(API_STATUS_CODE.ACCEPTED).send({
                    status: 'success',
                    message: 'Visitor created successfully',
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

visitorsRouter.post(
    '/get-my-data',
    authenticateToken,
    isUserRoleVisitor,
    async (req, res) => {
        getVisitorData(req.auth)
            .then((data) => {
                return res.status(API_STATUS_CODE.OK).send({
                    status: 'success',
                    message: data.message,
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

visitorsRouter.post('/update',
    authenticateToken,
    isUserRoleVisitor,
    checkUserIdValidity,
    updateVisitorDataValidator,
    async (req, res) => {
        updateVisitorData(req.body.visitor, req.auth)
            .then(data => {
                return res.status(API_STATUS_CODE.OK).send({
                    status: 'success',
                    message: "Visitor Data updated successfully"
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


/**
 * Through this API, visitors will scan projects to request the exhibitor to view the project document
 */
visitorsRouter.post('/scan-project',
    authenticateToken,
    isUserRoleExhibitorAdminOrExhibitorOrVisitor,
    validateScannerBodyData,
    async (req, res) => {
        insertDocumentRequestData(req.auth, req.body.scannerData)
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



/**
 * Through this API, approved visitors can view the project document
 */
visitorsRouter.post('/get-requested-document',
    authenticateToken,
    isUserRoleVisitor,
    paginationData,
    async (req, res) => {
        getRequestedDocumentData(req.auth, req.body, req.body.paginationData)
            .then(data => {
                return res.status(API_STATUS_CODE.OK).send({
                    status: 'success',
                    message: 'Get requested data successfully',
                    ...data
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


module.exports = {
    visitorsRouter,
};
