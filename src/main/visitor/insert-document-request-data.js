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

const { pool } = require("../../../database/db");
const { setRejectMessage } = require("../../common/set-reject-message");
const { API_STATUS_CODE } = require("../../consts/error-status");
const { format } = require('date-fns');



/**
 * This function will check whether the project and the company is exist or not.
 */
const checkIsProjectExist = async (scannerData) => {
    const _query = `
    SELECT
        id
    FROM 
        projects
    WHERE
        companies_id = ? AND
        id = ?;
    `;

    const _values = [
        scannerData.companyId,
        scannerData.projectId,
    ]

    try {
        const [result] = await pool.query(_query, _values);
        if (result.length > 0) {
            return true;
        }
        return false;
    } catch (error) {
        // console.log("🚀 ~ checkIsDocumentExist ~ error:", error);
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Operation failed')
        )
    }
}



/**
 * This function will check whether the visitor is already requested for the project or not.
 */
const checkIsProjectAlreadyRequested = async (authData, scannerData) => {
    const _query = `
    SELECT
        id
    FROM 
        approved_document
    WHERE
        visitor_id = ? AND
        company_id = ? AND
        project_id = ?;
    `;

    const _values = [
        authData.id,
        scannerData.companyId,
        scannerData.projectId,
    ]

    try {
        const [result] = await pool.query(_query, _values);
        if (result.length > 0) {
            return true;
        }
        return false;
    } catch (error) {
        // console.log("🚀 ~ checkIsDocumentExist ~ error:", error);
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Operation failed')
        )
    }
}

/**
 * This function will insert data into the database
 */
const insertScannerData = async (authData, scannerData) => {
    const _query = `
    INSERT INTO
        approved_document
        (
            visitor_id,
            company_id,
            project_id,
            is_approved,
            created_at
        )
    VALUES( ?, ?, ?, ?, ? );
    `;

    const _values = [
        authData.id,
        scannerData.companyId,
        scannerData.projectId,
        scannerData.isApproved,
        scannerData.createdAt
    ];

    try {
        const [result] = await pool.query(_query, _values);
        if (result.affectedRows > 0) {
            return true;
        }
        return false;
    } catch (error) {
        // console.log("🚀 ~ insertScannerData ~ error:", error);
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Operation failed')
        )
    }
}

/**
 * @description This function is used to send the request of visitors to the exhibitor to see the project documents
 */
const insertDocumentRequestData = async (authData, scannerData) => {
    const createdAt = new Date();

    scannerData = { ...scannerData, isApproved: '1', createdAt: createdAt };
    try {
        const isProjectExist = await checkIsProjectExist(scannerData);
        if (isProjectExist) {
            const isAlreadyRequested = await checkIsProjectAlreadyRequested(authData, scannerData);
            if (isAlreadyRequested) {
                return Promise.reject(
                    setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'You have already requested for the project')
                )
            } else {
                const isDataInserted = await insertScannerData(authData, scannerData);
                if (isDataInserted) {
                    return Promise.resolve({
                        status: 'success',
                        message: 'Your request is sent successfully'
                    })
                }

            }
        } else {
            return Promise.reject(
                setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Project data is not found')
            )
        }
    } catch (error) {
        console.log("🚀 ~ insertDocumentRequestData ~ error:", error)
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.INTERNAL_SERVER_ERROR, 'Internal server error')
        )
    }
};

module.exports = {
    insertDocumentRequestData
}