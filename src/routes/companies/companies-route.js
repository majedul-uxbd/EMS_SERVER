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
const { isUserRoleAdmin } = require('../../common/utilities/check-user-role');
const { paginationData } = require('../../middlewares/common/pagination-data');
const authenticateToken = require('../../middlewares/jwt');
const { getEnrolledCompanyData } = require('../../main/company/get-enrolled-company-data');
const { API_STATUS_CODE } = require('../../consts/error-status');
const { getEnrolledProjectData } = require('../../main/company/get-enrolled-company-project-data');
const companiesRouter = express.Router();


companiesRouter.use(authenticateToken);


/**
 * This API is used to get exhibitions based company data 
 */
companiesRouter.post('/get-enrolled-companies-data',
    isUserRoleAdmin,
    paginationData,
    async (req, res) => {

        getEnrolledCompanyData(req.body, req.body.paginationData)
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
* This API is used to get exhibitions based company data 
*/
companiesRouter.post('/get-enrolled-companies-project',
    isUserRoleAdmin,
    paginationData,
    async (req, res) => {

        getEnrolledProjectData(req.body, req.body.paginationData)
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
    companiesRouter,
};
