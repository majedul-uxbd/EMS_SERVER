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
const systemAdminRouter = express.Router();

const { checkUserIdValidity } = require('../../middelwares/check-user-id-validity');
const authenticateToken = require('../../middelwares/jwt');
const { deleteUserInfo } = require('../../middelwares/common/delete-user-info');
const { API_STATUS_CODE } = require('../../consts/error-status');
const { updateUserInfo } = require('../../middelwares/common/update-user-info');
const { updateUserDataValidator } = require('../../middelwares/user/update-user-data-validator');
const { isUserRoleAdmin } = require('../../common/utilities/check-user-role');
const { getAllUserTableData } = require('../../main/user/get-all-user-data');
const { paginationData } = require('../../middelwares/common/pagination-data');
const { getAllVisitorTableData } = require('../../main/user/get-all-visitor-data');
const { companyDataValidator } = require('../../main/user/company-data-validator');
const { addCompanyData } = require('../../main/user/add-company-data');
const { deleteCompanyInfo } = require('../../main/company/delete-company-info');
const { getCompanyTableData } = require('../../main/company/get-company-data');
const { activeCompanyInfo } = require('../../main/company/active-company-data');
const { updateCompanyInfo } = require('../../main/company/update-company-data');
const { getActiveCompanyData } = require('../../main/company/get-active-company-data');
const { getDocumentData } = require('../../main/document/get-document-data');

systemAdminRouter.use(authenticateToken);


systemAdminRouter.post('/get-user-data',
    isUserRoleAdmin,
    checkUserIdValidity,
    paginationData,
    async (req, res) => {
        getAllUserTableData(req.body, req.body.paginationData)
            .then(data => {
                return res.status(API_STATUS_CODE.OK).send({
                    status: 'success',
                    message: "Get user data successfully",
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
    });


systemAdminRouter.post('/get-visitor-data',
    isUserRoleAdmin,
    checkUserIdValidity,
    paginationData,
    async (req, res) => {
        getAllVisitorTableData(req.body.paginationData)
            .then(data => {
                return res.status(API_STATUS_CODE.OK).send({
                    status: 'success',
                    message: "Get visitors data successfully",
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
    });

systemAdminRouter.post('/delete',
    isUserRoleAdmin,
    async (req, res) => {
        deleteUserInfo(req.body)
            .then(data => {
                return res.status(API_STATUS_CODE.OK).send({
                    status: 'success',
                    message: "User deleted successfully"
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


systemAdminRouter.post('/update',
    isUserRoleAdmin,
    updateUserDataValidator,
    async (req, res) => {
        updateUserInfo(req.body.user, req.auth)
            .then(data => {
                return res.status(API_STATUS_CODE.OK).send({
                    status: 'success',
                    message: "User updated successfully"
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


systemAdminRouter.post('/add-company',
    checkUserIdValidity,
    isUserRoleAdmin,
    companyDataValidator,
    async (req, res) => {

        addCompanyData(req.body.companyData)
            .then(data => {
                return res.status(API_STATUS_CODE.OK).send({
                    status: 'success',
                    message: "Company created successfully"
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


systemAdminRouter.post('/delete-company',
    isUserRoleAdmin,
    async (req, res) => {
        deleteCompanyInfo(req.body)
            .then(data => {
                return res.status(API_STATUS_CODE.OK).send({
                    status: data.status,
                    message: data.message,
                    de_active_user: data.de_active_user,
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


systemAdminRouter.post('/active-company',
    isUserRoleAdmin,
    async (req, res) => {
        activeCompanyInfo(req.body)
            .then(data => {
                return res.status(API_STATUS_CODE.OK).send({
                    status: data.status,
                    message: data.message,
                    active_user: data.active_user,
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

systemAdminRouter.post('/get-company-data',
    isUserRoleAdmin,
    paginationData,
    async (req, res) => {
        getCompanyTableData(req.body.paginationData)
            .then(data => {
                return res.status(API_STATUS_CODE.OK).send({
                    status: 'success',
                    message: "Get Company data successfully",
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
    });


systemAdminRouter.post('/update-company',
    isUserRoleAdmin,
    companyDataValidator,
    async (req, res) => {
        updateCompanyInfo(req.body.companyData)
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
    });


systemAdminRouter.post('/active-company-data',
    isUserRoleAdmin,
    async (req, res) => {
        getActiveCompanyData()
            .then(data => {
                return res.status(API_STATUS_CODE.OK).send({
                    status: data.status,
                    message: data.message,
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
    });

/**
 * This API will return all document Data
 */
// systemAdminRouter.post('/get-document-data',
//     isUserRoleAdmin,
//     paginationData,
//     async (req, res) => {
//         getDocumentData(req.body.paginationData)
//             .then(data => {
//                 return res.status(API_STATUS_CODE.OK).send({
//                     status: 'success',
//                     message: 'Get document data successfully',
//                     ...data
//                 })
//             })
//             .catch(error => {
//                 const { statusCode, message } = error;
//                 return res.status(statusCode).send({
//                     status: 'failed',
//                     message: message,
//                 })
//             })
//     });

module.exports = {
    systemAdminRouter
}