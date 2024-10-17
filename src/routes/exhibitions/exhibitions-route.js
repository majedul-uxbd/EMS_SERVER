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
const exhibitionsRouter = express.Router();

const { addExhibitionsInfo } = require('../../main/exhibitions/add-exhibitions-info');
const { validateExhibitionsBodyData } = require('../../middelwares/exhibitions/validate-exhibitions-body-data');
const { API_STATUS_CODE } = require('../../consts/error-status');
const { isUserRoleAdmin } = require('../../common/utilities/check-user-role');
const { updateExhibitionData } = require('../../main/exhibitions/update-exhibitions-data');
const authenticateToken = require('../../middelwares/jwt');

exhibitionsRouter.use(authenticateToken);

exhibitionsRouter.post('/add',
    isUserRoleAdmin,
    validateExhibitionsBodyData,
    async (req, res) => {

        addExhibitionsInfo(req.body.bodyData)
            .then(data => {
                return res.status(API_STATUS_CODE.CREATED).send({
                    status: 'success',
                    message: data
                })
            })
            .catch(error => {
                const { statusCode, message } = error;
                return res.status(statusCode).send({
                    status: 'failed',
                    message: message,
                })
            });
    });


exhibitionsRouter.post('/update',
    isUserRoleAdmin,
    validateExhibitionsBodyData,
    async (req, res) => {

        updateExhibitionData(req.body.bodyData)
            .then(data => {
                return res.status(API_STATUS_CODE.CREATED).send({
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
            });
    });


module.exports = {
    exhibitionsRouter,
};