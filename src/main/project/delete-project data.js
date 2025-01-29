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


const checkProjectIdValidity = async (projectId) => {
    const _query = `
    SELECT
        id
    FROM
        projects
    WHERE
        id = ?;
    `;

    try {
        const [result] = await pool.query(_query, projectId);
        if (result.length > 0) {
            return true;
        }
        return false;
    } catch (error) {
        // console.log("🚀 ~ checkProjectIdValidity ~ error:", error)
        return Promise.reject(error);

    }
}

const deleteProjectDataQuery = async (projectId) => {
    const _query = `
    DELETE
    FROM
        projects
    WHERE
        id = ?;
    `;

    try {
        const [result] = await pool.query(_query, projectId);
        if (result.affectedRows > 0) {
            return true;
        }
        return false;
    } catch (error) {
        // console.log("🚀 ~ checkProjectIdValidity ~ error:", error)
        return Promise.reject(error);

    }
}

/**
 * @description This function is used to delete project data
 */
const deleteProjectData = async (projectData) => {
    const lgKey = projectData.lg;

    try {
        const isValidProjectId = await checkProjectIdValidity(projectData.id);
        if (!isValidProjectId) {
            return Promise.reject(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'project_is_not_found',
                    lgKey,
                )
            )
        }
        const isDeleteProject = await deleteProjectDataQuery(projectData.id);
        if (isDeleteProject) {
            return Promise.resolve(
                setServerResponse(
                    API_STATUS_CODE.OK,
                    'project_data_deleted_successfully',
                    lgKey,
                )
            )
        } else {
            return Promise.reject(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'failed_to_delete_project_data',
                    lgKey,
                )
            );
        }

    } catch (error) {
        // console.log('🚀 ~ file: delete-project data.js:101 ~ deleteProjectData ~ error:', error);
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
    deleteProjectData
}