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

const _ = require('lodash');
const { pool } = require("../../../database/db");
const { setRejectMessage } = require("../../common/set-reject-message");
const { API_STATUS_CODE } = require("../../consts/error-status");


const getProjectCompanyId = async (authData) => {
    const _query = `
    SELECT
        companies_id
    FROM
        user
    WHERE
        id = ?;
    `;
    try {
        const [result] = await pool.query(_query, authData.id);
        if (result.length > 0) {
            return Promise.resolve(result[0].companies_id);
        }
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


const getNumberOfRowsQuery = async (companyId) => {
    const _query = `
    SELECT count(*) AS totalRows
    FROM
        projects AS project
    LEFT JOIN documents AS document
        ON document.project_id = project.id
    LEFT JOIN
        user AS created_by_user 
    ON 
        project.created_by = created_by_user.id
    LEFT JOIN
        user AS updated_by_user 
    ON 
        project.updated_by = updated_by_user.id
    WHERE
        project.companies_id = ?
    `;

    try {
        const [result] = await pool.query(_query, companyId);
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


const getProjectDataQuery = async (companyId, paginationData) => {
    const _query = `
    SELECT
        project.id AS project_id,
        project.companies_id,
        project.project_name,
        project.project_platform,
        created_by_user.f_name AS created_by_user_f_name,
        created_by_user.l_name AS created_by_user_l_name,
        updated_by_user.f_name AS updated_by_user_f_name,
        updated_by_user.l_name AS updated_by_user_l_name,
        project.created_at,
        project.updated_at,
        document.id AS document_id,
        document.title,
        document.file_name,
        document.file_path
    FROM
        projects AS project
    LEFT JOIN documents AS document
        ON document.project_id = project.id
    LEFT JOIN
        user AS created_by_user 
    ON 
        project.created_by = created_by_user.id
    LEFT JOIN
        user AS updated_by_user 
    ON 
        project.updated_by = updated_by_user.id
    WHERE
        project.companies_id = ?
    LIMIT ?
    OFFSET ?;
    `;

    const _values = [
        companyId,
        paginationData.itemsPerPage,
        paginationData.offset
    ]

    try {
        const [result] = await pool.query(_query, _values);
        // console.log("🚀 ~ getProjectDataQuery ~ result:", result)
        return Promise.resolve(result);

    } catch (error) {
        // console.log("🚀 ~ getProjectDataQuery ~ error:", error)
        setRejectMessage(
            API_STATUS_CODE.INTERNAL_SERVER_ERROR,
            'operation_failed'
        )
    }
}

/**
 * @description This function is used to get project data based on company ID
 */
const getCompanyProjectData = async (authData, paginationData) => {
    try {
        const companyId = await getProjectCompanyId(authData)

        const totalRows = await getNumberOfRowsQuery(companyId);
        const documentData = await getProjectDataQuery(companyId, paginationData);

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
    getCompanyProjectData
}