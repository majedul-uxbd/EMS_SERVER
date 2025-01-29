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
const checkIsUserEnrolled = async (authData, scannerData) => {
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
        authData.id,
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
        return Promise.reject(error)
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
        return Promise.reject(error)
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
            exhibition_id,
            created_at
        )
    VALUES( ?, ?, ?, ?, ?, ? );
    `;

    const _values = [
        authData.id,
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
 * @description This function is used to send the request of visitors to the exhibitor to see the project documents
 */
const insertDocumentRequestData = async (authData, scannerData) => {
    const lgKey = scannerData.lg;
    const createdAt = new Date();

    scannerData = { ...scannerData, isApproved: '1', createdAt: createdAt };
    try {
        const isEnrolled = await checkIsUserEnrolled(authData, scannerData);
        if (!isEnrolled) {
            return Promise.reject(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'you_are_not_enrolled__in_this_exhibition',
                    lgKey
                )
            )
        }
        const isProjectExist = await checkIsProjectExist(scannerData);
        if (isProjectExist) {
            const isAlreadyRequested = await checkIsProjectAlreadyRequested(authData, scannerData);
            if (isAlreadyRequested) {
                return Promise.reject(
                    setServerResponse(
                        API_STATUS_CODE.BAD_REQUEST,
                        'you_have_already_requested_for_the_project',
                        lgKey
                    )
                )
            } else {
                const isDataInserted = await insertScannerData(authData, scannerData);
                if (isDataInserted) {
                    return Promise.resolve(
                        setServerResponse(
                            API_STATUS_CODE.OK,
                            'your_request_is_sent_successfully',
                            lgKey
                        ))
                }

            }
        } else {
            return Promise.reject(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'project_is_not_found',
                    lgKey
                )
            )
        }
    } catch (error) {
        // console.log("🚀 ~ insertDocumentRequestData ~ error:", error)
        return Promise.reject(
            setServerResponse(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                'internal_server_error',
                lgKey,
            )
        )
    }
};

module.exports = {
    insertDocumentRequestData
}