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


const getNumberOfRowsQuery = async (bodyData) => {
    const _query = `
    SELECT count(*) AS totalRows
    FROM
        documents AS doc
    LEFT JOIN
        user
    ON
        doc.uploaded_by = user.id
    WHERE
        project_id = ?;
    `;

    try {
        const [result] = await pool.query(_query, bodyData.projectId);
        return Promise.resolve(result[0]);
    } catch (error) {
        // console.log('🚀 ~ userLoginQuery ~ error:', error);
        return Promise.reject(
            setRejectMessage(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                'operation_failed'
            )
        );
    }
}

const getDocumentDataQuery = async (bodyData, paginationData) => {
    const _query = `
    SELECT
        doc.project_id,
        doc.title,
        doc.file_name,
        doc.file_path,
        user.f_name as uploaded_by_f_name,
        user.l_name as uploaded_by_l_name,
        doc.created_at,
        doc.updated_at
    FROM
        documents AS doc
    LEFT JOIN
        user
    ON
        doc.uploaded_by = user.id
    WHERE
        project_id = ?
    LIMIT ?
    OFFSET ?;
    `;

    const _values = [
        bodyData.projectId,
        paginationData.itemsPerPage,
        paginationData.offset
    ]

    try {
        const [result] = await pool.query(_query, _values);
        return Promise.resolve(result);

    } catch (error) {
        // console.log("🚀 ~ getDocumentDataQuery ~ error:", error)
        setRejectMessage(
            API_STATUS_CODE.INTERNAL_SERVER_ERROR,
            'operation_failed'
        )
    }
}

/**
 * @description This function is used to get document data based on project ID 
 */
const getDocumentData = async (bodyData, paginationData) => {
    try {
        const totalRows = await getNumberOfRowsQuery(bodyData);
        const documentData = await getDocumentDataQuery(bodyData, paginationData);
        return Promise.resolve({
            metadata: {
                totalRows: totalRows,
            },
            data: documentData
        });
    } catch (error) {
        // console.log("🚀 ~ getDocumentData ~ error:", error)
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.INTERNAL_SERVER_ERROR, 'Internal Server Error')
        );
    }
}
module.exports = {
    getDocumentData
}