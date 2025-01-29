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
const { setServerResponse } = require("../../common/set-server-response");
const { API_STATUS_CODE } = require("../../consts/error-status");


/**
 * This function will check whether the user is enrolled in this exhibition or not.
 */
const checkIsUserEnrolled = async (scannerData) => {
    const _query = `
    SELECT
        id
    FROM 
        exhibitions_has_visitor
    WHERE
        visitor_id = ? AND
        exhibition_id = ?;
    `;

    const _values = [
        scannerData.visitorId,
        scannerData.exhibitionId
    ]

    try {
        const [result] = await pool.query(_query, _values);
        if (result.length > 0) {
            return true;
        }
        return false;
    } catch (error) {
        // console.log("🚀 ~ checkIsDocumentExist ~ error:", error);
        return Promise.reject(error);
    }
}

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
        return Promise.reject(error)
    }
}


/**
 * This function will insert data into the database
 */
const insertScannerData = async (scannerData) => {
    const _query = `
    INSERT INTO
        approved_document
        (
            visitor_id,
            company_id,
            project_id,
            is_approved,
            exhibition_id,
            created_at
        )
    VALUES( ?, ?, ?, ?, ?, ? );
    `;

    const _values = [
        scannerData.visitorId,
        scannerData.companyId,
        scannerData.projectId,
        scannerData.isApproved,
        scannerData.exhibitionId,
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
        return Promise.reject(error)
    }
}

/**
 * @description This function is used to send project document to the visitor immediately
 */
const insertRequestedDocumentData = async (scannerData) => {
    const lgKey = scannerData.lg;

    const createdAt = new Date();
    scannerData = { ...scannerData, isApproved: '1', createdAt: createdAt };

    try {
        const isEnrolled = await checkIsUserEnrolled(scannerData);
        if (!isEnrolled) {
            return Promise.reject(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'visitor_is_not_enrolled_in_this_exhibition',
                    lgKey,
                )
            )
        }
        const isAlreadyRequested = await checkIsProjectAlreadyRequested(scannerData);
        if (isAlreadyRequested) {
            return Promise.reject(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'visitor_has_already_requested_for_the_project',
                    lgKey,
                )
            )
        } else {
            const isDataInserted = await insertScannerData(scannerData);
            if (isDataInserted) {
                return Promise.resolve(
                    setServerResponse(
                        API_STATUS_CODE.OK,
                        'your_request_is_sent_successfully',
                        lgKey,
                    )
                )
            }
        }
    } catch (error) {
        // console.log("🚀 ~ insertDocumentRequestData ~ error:", error)
        return Promise.reject(
            setServerResponse(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                'internal_server_error',
                lgKey,
            ))
    }
};

module.exports = {
    insertRequestedDocumentData
}