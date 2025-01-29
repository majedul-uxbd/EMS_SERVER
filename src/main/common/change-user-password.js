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

const bcrypt = require("bcrypt");
const _ = require('lodash')
const { API_STATUS_CODE } = require('../../consts/error-status');
const { pool } = require('../../../database/db');
const { setServerResponse } = require("../../common/set-server-response");


const getUserOldPassword = async (authData) => {
    let tableName;
    if (authData.role === 'visitor') {
        tableName = 'visitors';
    } else {
        tableName = 'user';
    }

    const query = `
    SELECT
        password
    FROM
        ${tableName}
    WHERE
        id = ? AND
        email = ?;
    `;

    const values = [
        authData.id,
        authData.email
    ]
    try {
        const [result] = await pool.query(query, values);
        return Promise.resolve(result);
    } catch (error) {
        return Promise.reject(error);
    }
}

const updateUserPassword = async (authData, password) => {
    let tableName;
    if (authData.role === 'visitor') {
        tableName = 'visitors';
    } else {
        tableName = 'user';
    }
    const _query = `
        UPDATE
            ${tableName}
        SET
            password = ?,
            updated_at = UTC_TIMESTAMP()
        WHERE
            id= ? AND
            email = ?;
    `;

    const _values = [
        password,
        authData.id,
        authData.email
    ]

    try {
        const [result] = await pool.query(_query, _values);
        if (result.affectedRows > 0) {
            return true;
        }
        return false;
    } catch (error) {
        return Promise.reject(error);
    }
}


/**
 * @description This function is used to reset user password
 */
const changeUserPassword = async (authData, bodyData) => {
    const lgKey = bodyData.lg;
    let userInfo;
    try {
        if (_.isEmpty(bodyData.oldPassword) || _.isEmpty(bodyData.newPassword)) {
            return Promise.reject(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'old_or_new_password_is_required',
                    lgKey
                )
            )
        }
        userInfo = await getUserOldPassword(authData);

        if (userInfo.length > 0) {
            const isMatched = await bcrypt.compare(bodyData.oldPassword, userInfo[0].password);

            if (!isMatched) {
                return Promise.reject(
                    setServerResponse(
                        API_STATUS_CODE.BAD_REQUEST,
                        'password_mismatch',
                        lgKey
                    )
                );
            }
            const newHashedPassword = await bcrypt.hash(bodyData.newPassword, 10);
            const isUpdated = await updateUserPassword(authData, newHashedPassword);
            if (isUpdated) {
                return Promise.resolve(
                    setServerResponse(
                        API_STATUS_CODE.OK,
                        'password_is_changed_successfully',
                        lgKey
                    )
                )
            } else {
                return Promise.reject(
                    setServerResponse(
                        API_STATUS_CODE.BAD_REQUEST,
                        'failed_to_update_password',
                        lgKey
                    )
                )
            }
        } else {
            return Promise.reject(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'user_not_found',
                    lgKey
                )
            );
        }
    } catch (error) {
        // console.log('🚀 ~ file: change-user-password.js:129 ~ changeUserPassword ~ error:', error);
        return Promise.reject(
            setServerResponse(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                'internal_server_error',
                lgKey
            )
        )
    }
}

module.exports = {
    changeUserPassword
}