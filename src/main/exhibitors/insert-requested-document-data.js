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


/**
 * This function will check whether the visitor is already requested for the project or not.
 */
const checkIsProjectAlreadyRequested = async (scannerData) => {
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
        scannerData.visitorId,
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
            approve_or_disapprove_by,
            created_at
        )
    VALUES( ?, ?, ?, ?, ?, ? );
    `;

    const _values = [
        scannerData.visitorId,
        scannerData.companyId,
        scannerData.projectId,
        scannerData.isApproved,
        authData.id,
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
 * @description This function is used to send project document to the visitor immediately
 */
const insertRequestedDocumentData = async (authData, scannerData) => {
    const createdAt = new Date();
    scannerData = { ...scannerData, isApproved: '1', createdAt: createdAt };

    try {
        const isAlreadyRequested = await checkIsProjectAlreadyRequested(scannerData);
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
    } catch (error) {
        // console.log("🚀 ~ insertDocumentRequestData ~ error:", error)
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.INTERNAL_SERVER_ERROR, 'Internal server error')
        )
    }
};

module.exports = {
    insertRequestedDocumentData
}