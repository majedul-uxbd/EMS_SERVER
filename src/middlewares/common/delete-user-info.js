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

const checkUserIdValidityQuery = async (userData) => {
    const tableName = [];
    if (userData.role === 'visitor') {
        tableName.push('visitors');
    }
    else {
        tableName.push('user');
    }

    const _query = `
    SELECT
        id
    FROM
        ${tableName}
    WHERE
        id = ? AND 
        is_user_active = ${1};
    `;
    try {
        const [result] = await pool.query(_query, userData.id);
        if (result.length > 0) {
            return true;
        }
        return false;
    } catch (error) {
        const { statusCode, status, message } = error;
        // console.log("🚀 ~ getUserData ~ error:", error)
        return res.status(statusCode).send({
            status: status,
            message: message,
        });
    }
}


const deleteUserInfoQuery = async (userData) => {
    const tableName = [];
    if (userData.role === 'visitor') {
        tableName.push('visitors');
    }
    else {
        tableName.push('user');
    }
    const _query = `
        UPDATE 
            ${tableName}
        SET 
            is_user_active = ${0}
        WHERE 
            id = ?;
    `;

    try {
        const [result] = await pool.query(_query, userData.id);
        if (result.affectedRows === 1) {
            return true;
        }
        return false;
    } catch (error) {
        // console.log("🚀 ~ getUserData ~ error:", error)
        const { statusCode, status, message } = error;
        return res.status(statusCode).send({
            status: status,
            message: message,
        });
    }
}

/**
 * @description This function will delete visitor and user data
 */
const deleteUserInfo = async (userData) => {
    const lgKey = userData.lg;

    try {
        const isUserAvailable = await checkUserIdValidityQuery(userData);
        if (isUserAvailable) {
            const isUserDelete = await deleteUserInfoQuery(userData);
            if (isUserDelete) {
                return Promise.resolve(
                    setServerResponse(
                        API_STATUS_CODE.OK,
                        'user_deactivated_successfully',
                        lgKey
                    )
                );
            }
        }
        else {
            return Promise.reject(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'user_not_found',
                    lgKey
                )
            )
        }
    } catch (error) {
        return Promise.reject(
            setServerResponse(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                'internal_server_error',
                lgKey
            )
        );
    }
}

module.exports = {
    deleteUserInfo
}