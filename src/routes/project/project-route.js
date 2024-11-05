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
const projectRouter = express.Router();

const authenticateToken = require('../../middlewares/jwt');
const { isUserRoleAdminOrExhibitorAdminOrExhibitor } = require('../../common/utilities/check-user-role');
const { createProjectData } = require('../../main/project/create-project');
const { API_STATUS_CODE } = require('../../consts/error-status');
const { updateProjectData } = require('../../main/project/update-project-data');
const { checkUserIdValidity } = require('../../middlewares/check-user-id-validity');
const { deleteProjectData } = require('../../main/project/delete-project data');
const { getAllProjectData } = require('../../main/project/get-all-project-data');
const { getProjectData } = require('../../main/project/get-project-data');
const { paginationData } = require('../../middlewares/common/pagination-data');
const { getDocumentData } = require('../../main/document/get-document-data');
const { getCompanyProjectData } = require('../../main/project/get-company-project-data');
const { deleteDocumentData } = require('../../main/document/delete-document-data');

projectRouter.use(authenticateToken);


/**
 * Project Create Api
 */
projectRouter.post('/add',
    isUserRoleAdminOrExhibitorAdminOrExhibitor,
    async (req, res) => {

        createProjectData(req.auth, req.body)
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


/**
 * Project Update Api
 */
projectRouter.post('/update',
    isUserRoleAdminOrExhibitorAdminOrExhibitor,
    checkUserIdValidity,
    async (req, res) => {
        updateProjectData(req.auth, req.body)
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

/**
 * Project Delete Api
 */
projectRouter.post('/delete',
    isUserRoleAdminOrExhibitorAdminOrExhibitor,
    checkUserIdValidity,
    async (req, res) => {
        deleteProjectData(req.body)
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

/**
 * All project get Api
 */
projectRouter.post('/get-all-project',
    isUserRoleAdminOrExhibitorAdminOrExhibitor,
    checkUserIdValidity,
    paginationData,
    async (req, res) => {
        getAllProjectData(req.body.paginationData)
            .then(data => {
                return res.status(API_STATUS_CODE.OK).send({
                    status: 'success',
                    message: 'Get all projects data successfully',
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
 * Get project info Api
 */
projectRouter.post('/get-project',
    isUserRoleAdminOrExhibitorAdminOrExhibitor,
    checkUserIdValidity,
    async (req, res) => {
        getProjectData(req.auth)
            .then(data => {
                return res.status(API_STATUS_CODE.OK).send({
                    status: 'success',
                    message: 'Get projects data successfully',
                    data
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
 * Get project data based on company id
 */
projectRouter.post('/get-company-project',
    isUserRoleAdminOrExhibitorAdminOrExhibitor,
    paginationData,
    async (req, res) => {
        getCompanyProjectData(req.auth, req.body.paginationData)
            .then(data => {
                return res.status(API_STATUS_CODE.OK).send({
                    status: 'success',
                    message: 'Get projects data successfully',
                    data
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
 * Get Document data based on project id
 */
projectRouter.post('/get-document',
    isUserRoleAdminOrExhibitorAdminOrExhibitor,
    paginationData,
    async (req, res) => {
        getDocumentData(req.body, req.body.paginationData)
            .then(data => {
                return res.status(API_STATUS_CODE.OK).send({
                    status: 'success',
                    message: 'Get document data successfully',
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
 * Delete Document data 
 */
projectRouter.post('/delete-document',
    isUserRoleAdminOrExhibitorAdminOrExhibitor,
    async (req, res) => {
        deleteDocumentData(req.body)
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
    })


module.exports = {
    projectRouter
}