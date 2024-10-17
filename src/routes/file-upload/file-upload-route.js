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
const fileUploadRouter = express.Router();

const authenticateToken = require('../../middelwares/jwt');
const { uploadFileValidator } = require('../../common/utilities/file-upload/upload-file-validation');
const { errorCheck } = require('../../common/utilities/file-upload/check-error');
const { API_STATUS_CODE } = require('../../consts/error-status');
const { uploadFileInfo } = require('../../main/upload-file/upload-file-info');

fileUploadRouter.use(authenticateToken);


fileUploadRouter.post('/file-upload',
    uploadFileValidator.single('pdf_file'),
    errorCheck,
    async (req, res) => {
        const filePath = req.file?.path;

        uploadFileInfo(filePath, req.body)
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

module.exports = {
    fileUploadRouter
}