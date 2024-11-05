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
        // console.log("🚀 ~ getUserData ~ error:", error)
        return res.status(API_STATUS_CODE.BAD_REQUEST).send({
            status: "failed",
            message: "Operation failed",
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
        return res.status(API_STATUS_CODE.BAD_REQUEST).send({
            status: "failed",
            message: "Operation failed",
        });
    }
}

/**
 * @description This function is used to delete user data from the database
 */
const deletePersonalData = async (authData) => {
    try {
        const isUserDelete = await deleteUserInfoQuery(authData);
        if (isUserDelete) {
            return Promise.resolve('User deleted successfully');
        } else {
            return Promise.reject(
                setRejectMessage(API_STATUS_CODE.BAD_REQUEST, "User not found")
            )
        }
    } catch (error) {
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.INTERNAL_SERVER_ERROR, "Internal Server Error")
        );
    }
}

module.exports = {
    deletePersonalData
}