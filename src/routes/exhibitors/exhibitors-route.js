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
const exhibitorsRouter = express.Router();


const { API_STATUS_CODE } = require('../../consts/error-status');
const authenticateToken = require('../../middelwares/jwt');
const { checkUserIdValidity } = require('../../middelwares/check-user-id-validity');
const { isUserRoleExhibitor,
    isUserRoleAdminOrExhibitorAdmin,
    isUserRoleExhibitorAdmin,
    isUserRoleExhibitorAdminOrExhibitor
} = require('../../common/utilities/check-user-role');
const { validateExhibitorsData } = require('../../middelwares/exhibitors/check-exhibitors-data');
const { addExhibitor } = require('../../main/exhibitors/add-exhibitors-data');
const { getExhibitorData } = require('../../main/exhibitors/get-exhibitor-data');
const { updateExhibitorData } = require('../../main/exhibitors/update-exhibitor-own-data-validator');
const { updateExhibitorDataValidator } = require('../../middelwares/exhibitors/update-exhibitor-data-validator');
const { paginationData } = require('../../middelwares/common/pagination-data');
const { deleteExhibitorData } = require('../../main/exhibitors/delete-exhibitor-data');
const { activeExhibitorData } = require('../../main/exhibitors/active-exhibitor-data');
const { updateAllExhibitorData } = require('../../main/exhibitors/update-all-exhibitor-data');


exhibitorsRouter.use(authenticateToken);



exhibitorsRouter.post(
    '/add',
    isUserRoleAdminOrExhibitorAdmin,
    validateExhibitorsData,
    async (req, res) => {

        addExhibitor(req.body.exhibitor)
            .then((data) => {
                return res.status(API_STATUS_CODE.ACCEPTED).send({
                    status: data.status,
                    message: data.message
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
    isUserRoleExhibitorAdmin,
    paginationData,
    async (req, res) => {
        getExhibitorData(req.auth, req.body.paginationData)
            .then((data) => {
                return res.status(API_STATUS_CODE.OK).send({
                    status: 'success',
                    message: 'Get exhibitor data successfully',
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



/**
 * This API will allow Exhibitor Admin to update all exhibitor data
 */
exhibitorsRouter.post('/update-all',
    checkUserIdValidity,
    isUserRoleExhibitorAdmin,
    updateExhibitorDataValidator,
    async (req, res) => {
        updateAllExhibitorData(req.body.exhibitorData, req.auth)
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
 * This API will allow Exhibitor to update their own data
 */
exhibitorsRouter.post('/update-personal',
    checkUserIdValidity,
    isUserRoleExhibitorAdminOrExhibitor,
    updateExhibitorDataValidator,
    async (req, res) => {
        updateExhibitorData(req.body.exhibitorData, req.auth)
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
 * This API will allow Exhibitor Admin to active de-active exhibitor
 */
exhibitorsRouter.post('/active',
    isUserRoleExhibitorAdmin,
    async (req, res) => {
        activeExhibitorData(req.auth, req.body)
            .then(data => {
                return res.status(API_STATUS_CODE.OK).send({
                    status: data.status,
                    message: data.message,
                })
            })
            .catch(error => {
                const { statusCode, message } = error;
                return res.status(statusCode).send({
                    status: 'failed',
                    message: message,
                })
            })
    });


/**
 * This API will allow Exhibitor Admin to de-active active exhibitor
 */
exhibitorsRouter.post('/de-active',
    isUserRoleExhibitorAdmin,
    async (req, res) => {
        deleteExhibitorData(req.auth, req.body)
            .then(data => {
                return res.status(API_STATUS_CODE.OK).send({
                    status: data.status,
                    message: data.message,
                })
            })
            .catch(error => {
                const { statusCode, message } = error;
                return res.status(statusCode).send({
                    status: 'failed',
                    message: message,
                })
            })
    });


module.exports = {
    exhibitorsRouter,
};
