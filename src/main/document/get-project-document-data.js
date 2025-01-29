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


const getNumberOfRowsQuery = async (bodyData) => {
    const _query = `
    SELECT count(*) AS totalRows
    FROM
        documents AS d
    LEFT JOIN user AS u
    ON
    d.uploaded_by = u.id
    LEFT JOIN projects AS p
    ON
        d.project_id = p.id
    WHERE
        p.id = ?;
    `;

    const _values = [
        bodyData.projectId,
    ]

    try {
        const [result] = await pool.query(_query, _values);
        return Promise.resolve(result[0]);
    } catch (error) {
        // console.log('🚀 ~ userLoginQuery ~ error:', error);
        return Promise.reject(error);
    }
}

const getProjectDocumentDataQuery = async (bodyData, paginationData) => {
    const _query = `
    SELECT
        d.id,
        d.title,
        d.file_name,
        d.file_path,
        u.f_name as uploaded_by_f_name,
        u.l_name as uploaded_by_l_name,
        d.created_at,
        d.updated_at
    FROM
        documents AS d
    LEFT JOIN user AS u
    ON
    d.uploaded_by = u.id
    LEFT JOIN projects AS p
    ON
        d.project_id = p.id
    WHERE
        p.id = ?
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
        return Promise.reject(error);
    }
}

/**
 * @description This function is used to get Document data based on Project ID
 */
const getProjectDocumentData = async (bodyData, paginationData) => {
    const lgKey = bodyData.lg;

    if (!bodyData.projectId) {
        return Promise.reject(
            setServerResponse(
                API_STATUS_CODE.BAD_REQUEST,
                'project_id_is_required',
                lgKey,
            )
        );
    }
    try {
        const totalRows = await getNumberOfRowsQuery(bodyData);
        const getData = await getProjectDocumentDataQuery(bodyData, paginationData);
        const result = {
            metadata: {
                totalRows: totalRows,
            },
            data: getData
        };
        return Promise.resolve(
            setServerResponse(
                API_STATUS_CODE.OK,
                'get_data_successfully',
                lgKey,
                result
            )
        )

    } catch (error) {
        // console.log('🚀 ~ file: get-project-document-data.js:163 ~ getProjectDocumentData ~ error:', error);
        return Promise.reject(
            setServerResponse(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                'internal_server_error',
                lgKey,
            )
        );
    }
}
module.exports = {
    getProjectDocumentData
}