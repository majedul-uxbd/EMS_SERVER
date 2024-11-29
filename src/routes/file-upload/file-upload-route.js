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
const fileUploadRouter = express.Router();

const authenticateToken = require('../../middlewares/jwt');
const path = require("path");

const { uploadFileValidator } = require('../../common/utilities/file-upload/upload-file-validation');
const { errorCheck } = require('../../common/utilities/file-upload/check-error');
const { API_STATUS_CODE } = require('../../consts/error-status');
const { uploadFileInfo } = require('../../main/upload-file/upload-file-info');
const { isUserRoleAdminOrExhibitorAdminOrExhibitor } = require('../../common/utilities/check-user-role');
const { uploadImageValidator } = require('../../common/utilities/file-upload/upload-image-validator');
const { insertImageData } = require('../../main/upload-file/upload-profile-image-info');
const { checkIfFileSavePathExist } = require('../../common/utilities/file-upload/check-file-path-exist');


fileUploadRouter.use(authenticateToken);

/**
 * This API is used to upload files
 */
fileUploadRouter.post('/file-upload',
    checkIfFileSavePathExist,
    isUserRoleAdminOrExhibitorAdminOrExhibitor,
    uploadFileValidator.single('pdf_file'),
    errorCheck,
    async (req, res) => {
        const fileInfo = req.file;

        uploadFileInfo(fileInfo, req.body, req.auth)
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
)


fileUploadRouter.post('/upload-image',
    checkIfFileSavePathExist,
    uploadImageValidator.single('upload_image'),
    errorCheck,
    async (req, res) => {
        const buffer = req.file?.buffer;

        insertImageData(buffer, req.auth)
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
    fileUploadRouter
}