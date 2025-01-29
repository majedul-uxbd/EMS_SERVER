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
const exhibitionsRouter = express.Router();

const { addExhibitionsInfo } = require('../../main/exhibitions/add-exhibitions-info');
const { validateExhibitionsBodyData } = require('../../middlewares/exhibitions/validate-exhibitions-body-data');
const { isUserRoleAdmin } = require('../../common/utilities/check-user-role');
const authenticateToken = require('../../middlewares/jwt');
const { deleteExhibitionsData } = require('../../main/exhibitions/delete-exhibitions-data');
const { deleteEventData } = require('../../main/exhibitions/delete-event-data');
const { updateExhibitionData } = require('../../main/exhibitions/update-exhibition-data');
const { getExhibitionDaysData } = require('../../main/exhibitions/get-exhibition-days-data');
const { getExhibitionDayWiseAttendanceData } = require('../../main/exhibitions/get-exhibition-days-wise-attendance');
const { paginationData } = require('../../middlewares/common/pagination-data');
const { updateEventDetails } = require('../../main/exhibitions/update-event-details');

exhibitionsRouter.use(authenticateToken);


/**
 * THrough this API admin can create exhibitions
 */
exhibitionsRouter.post('/add',
    isUserRoleAdmin,
    validateExhibitionsBodyData,
    async (req, res) => {

        addExhibitionsInfo(req.body.bodyData)
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
* THrough this API admin can update exhibitions data
*/
exhibitionsRouter.post('/update',
    isUserRoleAdmin,
    validateExhibitionsBodyData,
    async (req, res) => {

        updateExhibitionData(req.body.bodyData)
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
 * Through this API admin can delete exhibitions data
 */
exhibitionsRouter.post('/delete',
    isUserRoleAdmin,
    async (req, res) => {

        deleteExhibitionsData(req.body)
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
* Through this API admin can delete exhibitions data
*/
exhibitionsRouter.post('/delete-event',
    isUserRoleAdmin,
    async (req, res) => {

        deleteEventData(req.body)
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
* Through this API admin can see event days information based on exhibition ID
*/
exhibitionsRouter.post('/get-exhibition-days',
    isUserRoleAdmin,
    async (req, res) => {

        getExhibitionDaysData(req.body)
            .then((data) => {
                const { statusCode, status, message, result } = data;
                return res.status(statusCode).send({
                    status: status,
                    message: message,
                    eventDates: result
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
* Through this API admin can see event days information based on exhibition ID
*/
exhibitionsRouter.post('/exhibition-days-wise-attendance',
    isUserRoleAdmin,
    paginationData,
    async (req, res) => {
        getExhibitionDayWiseAttendanceData(req.body, req.body.paginationData)
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
    });


/**
* Through this API admin can add event details
*/
exhibitionsRouter.post('/update-event-details',
    isUserRoleAdmin,
    async (req, res) => {

        updateEventDetails(req.body)
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
    });




module.exports = {
    exhibitionsRouter,
};