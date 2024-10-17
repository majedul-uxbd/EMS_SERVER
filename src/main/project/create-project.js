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

const { pool } = require('../../../database/db');
const { setRejectMessage } = require("../../common/set-reject-message");
const { isValidProjectName, isValidProjectPlatform } = require('../../common/user-data-validator');
const { API_STATUS_CODE } = require('../../consts/error-status');


const getCompanyId = async (authData) => {
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
            return result[0].companies_id;
        }
    } catch (error) {
        // console.log("🚀 ~ getCompanyId ~ error:", error);
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Operation failed')

        );

    }
}


const insertProjectDataQuery = async (authData, projectData) => {
    const _query = `
    INSERT INTO
        projects
        (
            companies_id,
            project_name,
            project_platform,
            created_by,
            created_at
        )
    VALUES (?, ?, ?, ?, ?);
    `;
    const _values = [
        projectData.companyId,
        projectData.projectName,
        projectData.platform,
        authData.id,
        projectData.createdAt
    ];

    try {
        const [result] = await pool.query(_query, _values);
        if (result.affectedRows > 0) {
            return true;
        }
        return false;
    } catch (error) {
        // console.log("🚀 ~ getCompanyId ~ error:", error);
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Operation failed')
        );

    }
}


const createProjectData = async (authData, projectData) => {
    if (!isValidProjectName(projectData.projectName)) {
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Project Name is not valid')
        );
    }
    if (!isValidProjectPlatform(projectData.platform)) {
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Project platform is not valid')
        );
    }
    const epochTimestamp = Math.floor(new Date().getTime() / 1000);


    try {
        const companyId = await getCompanyId(authData);
        projectData = { ...projectData, companyId, createdAt: epochTimestamp };
        const isInsertData = await insertProjectDataQuery(authData, projectData);
        if (isInsertData) {
            return Promise.resolve({
                status: 'success',
                message: 'Project data successfully inserted'
            })
        }
    } catch (error) {
        // console.log("🚀 ~ createProjectData ~ error:", error)
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.INTERNAL_SERVER_ERROR, 'Internal Server Error')
        );
    }

}

module.exports = {
    createProjectData
}