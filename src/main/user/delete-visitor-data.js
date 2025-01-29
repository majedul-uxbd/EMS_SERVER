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
const _ = require("lodash");
const { setServerResponse } = require("../../common/set-server-response");
const { API_STATUS_CODE } = require("../../consts/error-status");

const checkUserIdValidityQuery = async (bodyData) => {
    const _query = `
    SELECT
        id
    FROM
        visitors
    WHERE
        id = ? AND 
        is_user_active = ${1};
    `;
    try {
        const [result] = await pool.query(_query, bodyData.id);
        if (result.length > 0) {
            return true;
        }
        return false;
    } catch (error) {
        return Promise.reject(error);

    }
}


const deleteUserInfoQuery = async (bodyData) => {
    const _query = `
        DELETE 
        FROM
            visitors
        WHERE
            id = ?;
    `;

    try {
        const [result] = await pool.query(_query, bodyData.id);
        if (result.affectedRows === 1) {
            return true;
        }
        return false;
    } catch (error) {
        // console.log("🚀 ~ getUserData ~ error:", error)
        return Promise.reject(error);
    }
}

/**
 * @description This function is used to delete user data from the database
 */
const deleteVisitorData = async (bodyData) => {
    const lgKey = bodyData.lg;
    try {
        if (_.isNil(bodyData.id)) {
            return Promise.reject(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'user_id_is_required',
                    lgKey,
                )
            )
        }
        const isExist = await checkUserIdValidityQuery(bodyData);
        if (!isExist) {
            return Promise.reject(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'user_has_already_deleted_or_not_found',
                    lgKey,
                )
            )
        }
        const isUserDelete = await deleteUserInfoQuery(bodyData);
        if (isUserDelete) {
            return Promise.reject(
                setServerResponse(
                    API_STATUS_CODE.OK,
                    'user_deleted_successfully',
                    lgKey,
                )
            )
        }
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
    deleteVisitorData
}