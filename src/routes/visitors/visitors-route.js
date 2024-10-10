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
const visitorsRouter = express.Router();


const { API_STATUS_CODE } = require('../../consts/error-status');
const authenticateToken = require('../../middelwares/jwt');
const { checkUserIdValidity } = require('../../middelwares/check-user-id-validity');
const { isUserRoleVisitor } = require('../../common/utilities/check-user-role');
const { validateVisitorData } = require('../../middelwares/visitors/check-visitor-data');
const { addVisitor } = require('../../main/visitor/add-visitors-data');
const { getVisitorData } = require('../../main/visitor/get-my-visitor-data');
const { updateVisitorDataValidator } = require('../../middelwares/visitors/update-visitor-data-validator');
const { updateVisitorData } = require('../../main/visitor/update-visitor-data');


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


module.exports = {
    visitorsRouter,
};
