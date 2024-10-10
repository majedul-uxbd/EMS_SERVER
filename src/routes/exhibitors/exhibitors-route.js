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
const exhibitorsRouter = express.Router();


const { API_STATUS_CODE } = require('../../consts/error-status');
const authenticateToken = require('../../middelwares/jwt');
const { checkUserIdValidity } = require('../../middelwares/check-user-id-validity');
const { isUserRoleExhibitor, isUserRoleAdminOrExhibitorAdmin } = require('../../common/utilities/check-user-role');
const { validateExhibitorsData } = require('../../middelwares/exhibitors/check-exhibitors-data');
const { addExhibitor } = require('../../main/exhibitors/add-exhibitors-data');
const { getExhibitorData } = require('../../main/exhibitors/get-exhibitor-data');
const { updateExhibitorData } = require('../../main/exhibitors/update-exhibitor-data-validator');
const { updateExhibitorDataValidator } = require('../../middelwares/exhibitors/update-exhibitor-data-validator');
const { paginationData } = require('../../middelwares/common/pagination-data');


exhibitorsRouter.post(
    '/add',
    authenticateToken,
    isUserRoleAdminOrExhibitorAdmin,
    validateExhibitorsData,
    async (req, res) => {

        addExhibitor(req.body.exhibitor)
            .then((data) => {
                return res.status(API_STATUS_CODE.ACCEPTED).send({
                    status: 'success',
                    message: 'Exhibitor created successfully',
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

exhibitorsRouter.post(
    '/get-exhibitor-data',
    authenticateToken,
    isUserRoleAdminOrExhibitorAdmin,
    paginationData,
    async (req, res) => {
        getExhibitorData(req.body.paginationData)
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

exhibitorsRouter.post('/update',
    authenticateToken,
    isUserRoleExhibitor,
    checkUserIdValidity,
    updateExhibitorDataValidator,
    async (req, res) => {
        updateExhibitorData(req.body.visitor, req.auth)
            .then(data => {
                return res.status(API_STATUS_CODE.OK).send({
                    status: 'success',
                    message: "Exhibitor Data updated successfully"
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
    exhibitorsRouter,
};
