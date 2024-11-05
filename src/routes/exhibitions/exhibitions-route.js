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
const { API_STATUS_CODE } = require('../../consts/error-status');
const { isUserRoleAdmin } = require('../../common/utilities/check-user-role');
const { getExhibitionData } = require('../../main/exhibitions/get-exhibitions-data');
const authenticateToken = require('../../middlewares/jwt');
const { deleteExhibitionsData } = require('../../main/exhibitions/delete-exhibitions-data');
const { paginationData } = require('../../middlewares/common/pagination-data');

exhibitionsRouter.use(authenticateToken);


/**
 * THrough this API admin can create exhibitions
 */
exhibitionsRouter.post('/add',
    isUserRoleAdmin,
    validateExhibitionsBodyData,
    async (req, res) => {

        addExhibitionsInfo(req.body.bodyData)
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
            });
    });

/**
 * TODO: Need to work on this API. This is not running API
 */
// exhibitionsRouter.post('/update',
//     isUserRoleAdmin,
//     validateExhibitionsBodyData,
//     async (req, res) => {

//         updateExhibitionData(req.body.bodyData)
//             .then(data => {
//                 return res.status(API_STATUS_CODE.CREATED).send({
//                     status: data.status,
//                     message: data.message
//                 })
//             })
//             .catch(error => {
//                 const { statusCode, message } = error;
//                 return res.status(statusCode).send({
//                     status: 'failed',
//                     message: message,
//                 })
//             });
//     });


/**
 * Through this API admin can delete exhibitions data
 */
exhibitionsRouter.post('/delete',
    isUserRoleAdmin,
    async (req, res) => {

        deleteExhibitionsData(req.body)
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


/**
* Through this API admin can see all exhibitions data
*/
exhibitionsRouter.post('/get-exhibition-data',
    isUserRoleAdmin,
    paginationData,
    async (req, res) => {

        getExhibitionData(req.body.paginationData)
            .then(data => {
                return res.status(API_STATUS_CODE.CREATED).send({
                    status: 'success',
                    message: 'Get exhibitions data successfully',
                    ...data
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