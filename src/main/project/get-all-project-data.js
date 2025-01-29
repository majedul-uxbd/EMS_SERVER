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
        return Promise.reject(error);
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
            document.id,
            document.title,
            document.file_name,
            document.file_path
        FROM
            projects AS project
        LEFT JOIN companies AS company
            ON project.companies_id = company.id
        LEFT JOIN documents AS document
            ON document.project_id = project.id
        LEFT JOIN user AS created_by_user 
            ON project.created_by = created_by_user.id
        LEFT JOIN user AS updated_by_user 
            ON project.updated_by = updated_by_user.id
        WHERE
            document.id IS NOT NULL
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
        return Promise.reject(error);
    }
}

/**
 * @description This function is used to get all project data
 */
const getAllProjectData = async (bodyData, paginationData) => {
    const lgKey = bodyData.lg;

    try {
        const totalRows = await getNumberOfRowsQuery();
        const getProjectData = await getProjectDataQuery(paginationData);

        const result = {
            metadata: {
                totalRows: totalRows,
            },
            getProjectData: getProjectData
        };
        return Promise.resolve(
            setServerResponse(
                API_STATUS_CODE.OK,
                'get_data_successfully',
                lgKey,
                result
            )
        );

    } catch (error) {
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
    getAllProjectData
}