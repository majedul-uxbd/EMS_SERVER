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

const fs = require("fs").promises;
const _ = require("lodash");
const { pool } = require("../../../database/db");
const { setRejectMessage } = require("../../common/set-reject-message");
const { isValidDocumentTitle } = require("../../common/user-data-validator");
const { API_STATUS_CODE } = require("../../consts/error-status");



const checkIfProjectExist = async (projectId) => {
    const _query = `
    SELECT 
        id
    FROM
        projects
    WHERE
        id = ?;
    `;

    try {
        const [result] = await pool.query(_query, projectId);
        if (result.length > 0) {
            return true;
        }
        return false;
    } catch (error) {
        // console.log("🚀 ~ getCompanyId ~ error:", error);
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Operation failed')
        );

    }
}

const deleteUploadedFile = async (filePath) => {
    try {
        await fs.unlink(filePath);
        return true;
    } catch (error) {
        return false;
    }
};

const insertDocumentDataQuery = async (documentData) => {
    const _query = `
    INSERT INTO
        documents
        (
            project_id,
            title,
            file_path,
            created_at
        )
    VALUES (?, ?, ?, ?);
    `;
    const _values = [
        documentData.projectId,
        documentData.title,
        documentData.filePath,
        documentData.createdAt
    ];

    try {
        const [result] = await pool.query(_query, _values);
        if (result.affectedRows > 0) {
            return true;
        }
        return false;
    } catch (error) {
        // console.log("🚀 ~ getCompanyId ~ error:", error);
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Operation failed')
        );

    }
}

const uploadFileInfo = async (filePath, fileData) => {

    const epochTimestamp = Math.floor(new Date().getTime() / 1000);
    const documentData = {
        projectId: fileData.projectId,
        title: fileData.title,
        filePath: filePath,
        createdAt: epochTimestamp
    }
    if (!isValidDocumentTitle(documentData.title)) {
        await deleteUploadedFile(filePath);
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Document title is not valid')
        );
    }
    if (_.isEmpty(filePath)) {
        await deleteUploadedFile(filePath);
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Failed to upload file')
        );
    }
    if (_.isNil(documentData.projectId)) {
        await deleteUploadedFile(filePath);
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Project id is required')
        );
    }
    try {
        const isIdValid = await checkIfProjectExist(documentData.projectId);
        if (isIdValid) {
            const isInsertData = await insertDocumentDataQuery(documentData,);
            if (isInsertData) {
                return Promise.resolve({
                    status: 'success',
                    message: 'File uploaded successfully'
                })
            } else {
                await deleteUploadedFile(filePath);
                return Promise.reject(
                    setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Failed to upload file')
                )
            }
        } else {
            await deleteUploadedFile(filePath);
            return Promise.reject(
                setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Project is not found')
            )
        }
    } catch (error) {
        // console.log("🚀 ~ uploadFileInfo ~ error:", error)
        await deleteUploadedFile(filePath);
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Failed to upload file')
        )
    }
}

module.exports = {
    uploadFileInfo
}