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



const getNumberOfRowsQuery = async () => {
    const _query = `
    SELECT count(*) AS totalRows
    FROM
        projects AS project
    LEFT JOIN companies AS company
    ON
        project.companies_id = company.id
    LEFT JOIN documents AS document
    ON
        document.project_id = project.id
    LEFT JOIN
        user AS created_by_user 
    ON 
        project.created_by = created_by_user.id
    LEFT JOIN
        user AS updated_by_user 
    ON 
        project.updated_by = updated_by_user.id;
    `;

    try {
        const [result] = await pool.query(_query);
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

const getProjectDataQuery = async (paginationData) => {
    const _query = `
        SELECT
        project.project_name,
        project.project_platform,
        created_by_user.f_name AS created_by_user_f_name,
        created_by_user.l_name AS created_by_user_l_name,
        updated_by_user.f_name AS updated_by_user_f_name,
        updated_by_user.l_name AS updated_by_user_l_name,
        project.created_at,
        project.updated_at,
        company.name AS company_name,
        company.website_link,
        company.address,
        company.email,
        document.title,
        document.file_name,
        document.file_path
    FROM
        projects AS project
    LEFT JOIN companies AS company
    ON
        project.companies_id = company.id
    LEFT JOIN documents AS document
    ON
        document.project_id = project.id
    LEFT JOIN
        user AS created_by_user 
    ON 
        project.created_by = created_by_user.id
    LEFT JOIN
        user AS updated_by_user 
    ON 
        project.updated_by = updated_by_user.id
    LIMIT ?
    OFFSET ?;
    `;

    const _values = [
        paginationData.itemsPerPage,
        paginationData.offset
    ]

    try {
        const [result] = await pool.query(_query, _values);
        return Promise.resolve(result);

    } catch (error) {
        setRejectMessage(
            API_STATUS_CODE.INTERNAL_SERVER_ERROR,
            'operation_failed'
        )
    }
}

/**
 * @description This function is used to get all project data
 */
const getAllProjectData = async (paginationData) => {
    try {
        const totalRows = await getNumberOfRowsQuery();
        const getData = await getProjectDataQuery(paginationData);

        return Promise.resolve({
            metadata: {
                totalRows: totalRows,
            },
            data: getData
        });

    } catch (error) {
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.INTERNAL_SERVER_ERROR, 'Internal Server Error')
        );
    }
}
module.exports = {
    getAllProjectData
}