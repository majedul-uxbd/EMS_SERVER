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

const { pool } = require("../../../database/db");
const { setRejectMessage } = require("../../common/set-reject-message");
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
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Operation failed')
        );

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
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Operation failed')
        );

    }
}


const deleteProjectData = async (projectData) => {
    try {
        const isValidProjectId = await checkProjectIdValidity(projectData.id);
        if (isValidProjectId) {
            const isDeleteProject = await deleteProjectDataQuery(projectData.id);
            if (isDeleteProject) {
                return Promise.resolve({
                    status: 'success',
                    message: 'Project data deleted successfully'
                })
            } else {
                return Promise.reject(
                    setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Failed to delete project data')
                );
            }
        }
    } catch (error) {

    }

}

module.exports = {
    deleteProjectData
}