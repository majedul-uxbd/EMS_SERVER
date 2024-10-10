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
const { validateExhibitionsBodyData } = require('../../middelwares/exhibitions/validate-exhibitions-body-data');
const { API_STATUS_CODE } = require('../../consts/error-status');
const { isUserRoleAdmin } = require('../../common/utilities/check-user-role');


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


module.exports = {
    exhibitionsRouter,
};