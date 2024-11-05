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
            return Promise.resolve(result[0].companies_id)
        }
    } catch (error) {
        // console.log("🚀 ~ getCompanyId ~ error:", error)
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Operation failed')
        );
    }
}


const getProjectDataQuery = async (companyId) => {
    const _query = `
    SELECT
        id,
        companies_id,
        project_name,
        project_platform,
        created_by,
        updated_by
    FROM
        projects
    WHERE
        companies_id  = ?;
    `;

    try {
        const [result] = await pool.query(_query, companyId);
        return Promise.resolve(result)
    } catch (error) {
        // console.log("🚀 ~ getCompanyId ~ error:", error)
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Operation failed')
        );
    }
};

/**
 * @description This function is used to get project data based on user company ID for Dropdown
 */
const getProjectData = async (authData) => {
    try {
        const companyId = await getCompanyId(authData);
        if (!_.isNil(companyId)) {
            const projectData = await getProjectDataQuery(companyId)
            return Promise.resolve(projectData);
        } else {
            return Promise.reject(
                setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'No')
            );
        }
    } catch (error) {
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.INTERNAL_SERVER_ERROR, 'Internal Server Error')
        );
    }
}

module.exports = {
    getProjectData
}