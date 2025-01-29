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

const { setServerResponse } = require("../../common/set-server-response");
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
        return Promise.reject(error);

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
        return Promise.reject(error);

    }
}

/**
 * @description This function is used to upload file data into the database. 
 */
const uploadFileInfo = async (fileInfo, bodyData, authData) => {
    // console.log(fileInfo, bodyData, authData);
    const lgKey = bodyData.lg;

    const createdAt = new Date();

    const documentData = {
        projectId: bodyData.projectId,
        title: bodyData.title,
        fileName: fileInfo.filename,
        filePath: fileInfo.path,
        createdAt: createdAt
    }
    if (!isValidDocumentTitle(documentData.title)) {
        await deleteUploadedFile(fileInfo.path);
        return Promise.reject(
            setServerResponse(
                API_STATUS_CODE.BAD_REQUEST,
                'document_title_is_not_valid',
                lgKey,
            )
        );
    }
    if (_.isEmpty(documentData.filePath)) {
        await deleteUploadedFile(fileInfo.path);
        return Promise.reject(
            setServerResponse(
                API_STATUS_CODE.BAD_REQUEST,
                'failed_to_upload_file',
                lgKey,
            )
        );
    }
    if (_.isNil(documentData.projectId)) {
        await deleteUploadedFile(fileInfo.path);
        return Promise.reject(
            setServerResponse(
                API_STATUS_CODE.BAD_REQUEST,
                'project_id_is_required',
                lgKey,
            )
        );
    }
    try {
        const isIdValid = await checkIfProjectExist(documentData.projectId);
        if (isIdValid) {
            const isInsertData = await insertDocumentDataQuery(documentData, authData);
            if (isInsertData) {
                return Promise.resolve(
                    setServerResponse(
                        API_STATUS_CODE.OK,
                        'file_uploaded_successfully',
                        lgKey,
                    )
                )
            } else {
                await deleteUploadedFile(fileInfo.path);
                return Promise.reject(
                    setServerResponse(
                        API_STATUS_CODE.BAD_REQUEST,
                        'failed_to_upload_file',
                        lgKey,
                    )
                )
            }
        } else {
            await deleteUploadedFile(fileInfo.path);
            return Promise.reject(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'project_is_not_found',
                    lgKey,
                )
            )
        }
    } catch (error) {
        // console.log("🚀 ~ uploadFileInfo ~ error:", error)
        await deleteUploadedFile(fileInfo.path);
        return Promise.reject(
            setServerResponse(
                API_STATUS_CODE.BAD_REQUEST,
                'failed_to_upload_file',
                lgKey,
            )
        )
    }
}

module.exports = {
    uploadFileInfo
}