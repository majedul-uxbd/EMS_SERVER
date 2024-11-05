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

const insertDocumentDataQuery = async (documentData, authData) => {
    const _query = `
    INSERT INTO
        documents
        (
            project_id,
            title,
            file_name,
            file_path,
            uploaded_by,
            created_at
        )
    VALUES (?, ?, ?, ?, ?, ?);
    `;
    const _values = [
        documentData.projectId,
        documentData.title,
        documentData.fileName,
        documentData.filePath,
        authData.id,
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

/**
 * @description This function is used to upload file data into the database. 
 */
const uploadFileInfo = async (fileInfo, fileData, authData) => {

    const createdAt = new Date();

    const documentData = {
        projectId: fileData.projectId,
        title: fileData.title,
        fileName: fileInfo.filename,
        filePath: fileInfo.path,
        createdAt: createdAt
    }
    if (!isValidDocumentTitle(documentData.title)) {
        await deleteUploadedFile(fileInfo.path);
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Document title is not valid')
        );
    }
    if (_.isEmpty(documentData.filePath)) {
        await deleteUploadedFile(fileInfo.path);
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Failed to upload file')
        );
    }
    if (_.isNil(documentData.projectId)) {
        await deleteUploadedFile(fileInfo.path);
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Project id is required')
        );
    }
    try {
        const isIdValid = await checkIfProjectExist(documentData.projectId);
        if (isIdValid) {
            const isInsertData = await insertDocumentDataQuery(documentData, authData);
            if (isInsertData) {
                return Promise.resolve({
                    status: 'success',
                    message: 'File uploaded successfully'
                })
            } else {
                await deleteUploadedFile(fileInfo.path);
                return Promise.reject(
                    setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Failed to upload file')
                )
            }
        } else {
            await deleteUploadedFile(fileInfo.path);
            return Promise.reject(
                setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Project is not found')
            )
        }
    } catch (error) {
        // console.log("🚀 ~ uploadFileInfo ~ error:", error)
        await deleteUploadedFile(fileInfo.path);
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Failed to upload file')
        )
    }
}

module.exports = {
    uploadFileInfo
}