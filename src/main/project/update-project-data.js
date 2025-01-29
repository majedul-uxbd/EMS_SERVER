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

const { pool } = require('../../../database/db');
const _ = require('lodash');

const { setServerResponse } = require("../../common/set-server-response");
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
        return Promise.reject(error);
    }
};

const getCompanyWiseProjectId = async (companyId, projectId) => {
    const _query = `
    SELECT
        id
    FROM
        projects
    WHERE
        companies_id = ? AND
        id = ?;
    `;

    try {
        const [result] = await pool.query(_query, [companyId, projectId]);
        if (result.length > 0) {
            return true;
        } return false;
    } catch (error) {
        // console.log("🚀 ~ getCompanyId ~ error:", error);
        return Promise.reject(error);
    }
};

const updateProjectDataQuery = async (authData, projectData) => {
    let _query = `UPDATE projects SET `;
    const _values = [];

    if (projectData.projectName) {
        _query += 'project_name = ? ';
        _values.push(projectData.projectName);
    }

    if (projectData.platform) {
        if (_values.length > 0) {
            _query += ', ';
        }
        _query += 'project_platform = ? ';
        _values.push(projectData.platform);
    }

    if (_values.length > 0) {
        _query += ', updated_by = ? ';
        _values.push(authData.id);
    }

    if (_values.length > 0) {
        _query += ', updated_at = ? ';
        _values.push(projectData.updatedAt);
    }

    _query += 'WHERE id  = ?';
    _values.push(projectData.id);

    try {
        const [result] = await pool.query(_query, _values);
        if (result.affectedRows > 0) {
            return true;
        }
        return false;
    } catch (error) {
        // console.log("🚀 ~ getCompanyId ~ error:", error);
        return Promise.reject(error);

    }
}

const checkDuplicateProjectName = async (companyId) => {
    const _query = `
    SELECT
        id,
        project_name
    FROM
        projects
    WHERE
		companies_id = ?;
    `;

    try {
        const [result] = await pool.query(_query, companyId);
        if (result.length > 0) {
            return result
        }
    } catch (error) {
        // console.log("🚀 ~ getCompanyId ~ error:", error);
        return Promise.reject(error);
    }
};


/**
 * @param {string} str1 
 * @param {string} str2 
 * @param {boolean} caseInsensitive 
 * @description This function will check if the str1 and str2 are the same string or not.
 */
const compareStrings = (str1, str2, caseInsensitive = true) => {
    const splitStr1 = str1.trim().split(/\s+/);
    const splitStr2 = str2.trim().split(/\s+/);

    if (splitStr1.length === splitStr2.length) {
        for (let i = 0; i < splitStr1.length; i++) {
            if (caseInsensitive) {
                if (splitStr1[i].toLowerCase() !== splitStr2[i].toLowerCase()) {
                    return false;
                }
            } else {
                if (splitStr1[i] !== splitStr2[i]) {
                    return false;
                }
            }
        }
        return true;
    }
    return false;
}


/**
 * @description This function is used to update project data
 */
const updateProjectData = async (authData, projectData) => {
    const lgKey = projectData.lg;

    if (_.isNil(projectData.id)) {
        return Promise.reject(
            setServerResponse(
                API_STATUS_CODE.BAD_REQUEST,
                'project_id_is_required',
                lgKey,
            )
        );
    }
    const updatedAt = new Date();
    let isMatched = false;

    try {
        const companyId = await getCompanyId(authData);
        const isExist = await getCompanyWiseProjectId(companyId, projectData.id);
        if (!isExist) {
            return Promise.reject(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'project_is_not_found',
                    lgKey,
                )
            );
        }
        if (projectData.projectName) {
            const projectName = await checkDuplicateProjectName(companyId);
            for (const project of projectName) {
                if (project.id === projectData.id) {
                    continue;
                }
                const result = compareStrings(projectData.projectName, project.project_name);
                if (result) {
                    // console.log(`Match found: ${projectData.projectName} matches with ${project.project_name}`);
                    isMatched = true;
                    break;
                }
            }
            if (isMatched === true) {
                return Promise.reject(
                    setServerResponse(
                        API_STATUS_CODE.BAD_REQUEST,
                        'project_name_has_already_exists',
                        lgKey,
                    )
                );
            }
        }
        projectData = { ...projectData, updatedAt: updatedAt };
        const isUpdateData = await updateProjectDataQuery(authData, projectData);
        if (isUpdateData) {
            return Promise.resolve(
                setServerResponse(
                    API_STATUS_CODE.OK,
                    'project_data_updated_successfully',
                    lgKey,
                )
            )
        } else {
            return Promise.reject(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'failed_to_update_project_data',
                    lgKey,
                )
            );
        }
    } catch (error) {
        // console.log('🚀 ~ file: update-project-data.js:235 ~ updateProjectData ~ error:', error);
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
    updateProjectData
}