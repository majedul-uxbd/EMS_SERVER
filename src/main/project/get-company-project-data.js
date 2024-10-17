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

const _ = require('lodash');
const { pool } = require("../../../database/db");
const { setRejectMessage } = require("../../common/set-reject-message");
const { API_STATUS_CODE } = require("../../consts/error-status");


const getNumberOfRowsQuery = async (bodyData) => {
    const _query = `
    SELECT count(*) AS totalRows
    FROM
        projects
    WHERE
        companies_id = ?
    `;

    try {
        const [result] = await pool.query(_query, bodyData.companyId);
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


const getProjectDataQuery = async (bodyData, paginationData) => {
    const _query = `
    SELECT
        project.project_name,
        project.project_platform,
        created_by_user.f_name AS created_by_user_f_name,
        created_by_user.l_name AS created_by_user_l_name,
        updated_by_user.f_name AS updated_by_user_f_name,
        updated_by_user.l_name AS updated_by_user_l_name,
        project.created_at,
        project.updated_at
    FROM
        projects AS project
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
        bodyData.companyId,
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


const getCompanyProjectData = async (bodyData, paginationData) => {
    try {
        if (!_.isNil(bodyData.companyId)) {
            if (!_.isNumber(bodyData.companyId)) {
                return Promise.reject(
                    setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Company ID must be number')
                )
            }
        } else {
            return Promise.reject(
                setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Company ID is required')
            )
        }
        const totalRows = await getNumberOfRowsQuery(bodyData);
        const documentData = await getProjectDataQuery(bodyData, paginationData);
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