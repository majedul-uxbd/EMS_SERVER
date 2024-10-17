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
const _ = require('lodash');
const { setRejectMessage } = require("../../common/set-reject-message");
const { API_STATUS_CODE } = require('../../consts/error-status');


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
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Operation failed')
        );

    }
}


const updateProjectData = async (authData, projectData) => {
    if (_.isNil(projectData.id)) {
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Project ID is required')
        );
    }
    const epochTimestamp = Math.floor(new Date().getTime() / 1000);


    try {
        projectData = { ...projectData, updatedAt: epochTimestamp };
        const isUpdateData = await updateProjectDataQuery(authData, projectData);
        if (isUpdateData) {
            return Promise.resolve({
                status: 'success',
                message: 'Project data updated successfully'
            })
        } else {
            return Promise.reject(
                setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Failed to update project data')
            );
        }
    } catch (error) {
        // console.log("🚀 ~ createProjectData ~ error:", error)
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.INTERNAL_SERVER_ERROR, 'Internal Server Error')
        );
    }

}

module.exports = {
    updateProjectData
}