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

const { uploadFileValidator } = require('../../common/utilities/file-upload/upload-file-validation');
const { errorCheck } = require('../../common/utilities/file-upload/check-error');
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

    }
)


fileUploadRouter.post('/upload-image',
    checkIfFileSavePathExist,
    uploadImageValidator.single('upload_image'),
    errorCheck,
    async (req, res) => {
        const buffer = req.file?.buffer;

        insertImageData(buffer, req.auth, req.body)
            .then((data) => {
                const { statusCode, status, message, result } = data;
                return res.status(statusCode).send({
                    status: status,
                    message: message,
                    filePath: result
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
    fileUploadRouter
}