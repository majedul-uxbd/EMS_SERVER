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
const { isUserRoleAdminOrExhibitorAdminOrExhibitor, isUserRoleAdmin } = require('../../common/utilities/check-user-role');
const { createProjectData } = require('../../main/project/create-project');
const { updateProjectData } = require('../../main/project/update-project-data');
const { deleteProjectData } = require('../../main/project/delete-project data');
const { getAllProjectData } = require('../../main/project/get-all-project-data');
const { getProjectData } = require('../../main/project/get-project-data');
const { paginationData } = require('../../middlewares/common/pagination-data');
const { getDocumentData } = require('../../main/document/get-document-data');
const { getCompanyProjectData } = require('../../main/project/get-company-project-data');
const { deleteDocumentData } = require('../../main/document/delete-document-data');
const { getProjectDocumentData } = require('../../main/document/get-project-document-data');

projectRouter.use(authenticateToken);


/**
 * Project Create Api
 */
projectRouter.post('/add',
    isUserRoleAdminOrExhibitorAdminOrExhibitor,
    async (req, res) => {

        createProjectData(req.auth, req.body)
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
 * Project Update Api
 */
projectRouter.post('/update',
    isUserRoleAdminOrExhibitorAdminOrExhibitor,
    async (req, res) => {
        updateProjectData(req.auth, req.body)
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
 * Project Delete Api
 */
projectRouter.post('/delete',
    isUserRoleAdminOrExhibitorAdminOrExhibitor,
    async (req, res) => {
        deleteProjectData(req.body)
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
 * All project get Api
 */
projectRouter.post('/get-all-project',
    isUserRoleAdminOrExhibitorAdminOrExhibitor,
    paginationData,
    async (req, res) => {
        getAllProjectData(req.body, req.body.paginationData)
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
 * Get project info Api
 */
projectRouter.post('/get-project',
    isUserRoleAdminOrExhibitorAdminOrExhibitor,
    async (req, res) => {
        getProjectData(req.auth, req.body)
            .then((data) => {
                const { statusCode, status, message, result } = data;
                return res.status(statusCode).send({
                    status: status,
                    message: message,
                    projectData: result
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
* Get project data based on company id
*/
projectRouter.post('/get-company-project',
    isUserRoleAdminOrExhibitorAdminOrExhibitor,
    paginationData,
    async (req, res) => {
        getCompanyProjectData(req.auth, req.body, req.body.paginationData)
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
 * Get Document data based on project id
 */
projectRouter.post('/get-document',
    isUserRoleAdminOrExhibitorAdminOrExhibitor,
    paginationData,
    async (req, res) => {
        getDocumentData(req.body, req.body.paginationData)
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
 * Delete Document data 
 */
projectRouter.post('/delete-document',
    isUserRoleAdminOrExhibitorAdminOrExhibitor,
    async (req, res) => {
        deleteDocumentData(req.body)
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
    })


/**
 * This API is used to get Project Document based on project ID
 */
projectRouter.post('/get-project-document',
    isUserRoleAdmin,
    paginationData,
    async (req, res) => {

        getProjectDocumentData(req.body, req.body.paginationData)
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
    })


module.exports = {
    projectRouter
}