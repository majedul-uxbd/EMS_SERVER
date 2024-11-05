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
const _ = require('lodash');
const { setRejectMessage } = require("../../common/set-reject-message");
const { API_STATUS_CODE } = require("../../consts/error-status");


const getExhibitorCompanyQuery = async (authData) => {
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
            return Promise.resolve(result[0].companies_id);
        }
    } catch (error) {
        // console.log('🚀 ~ userLoginQuery ~ error:', error);
        return Promise.reject(
            setRejectMessage(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                'operation_failed'
            )
        );
    }
}

const checkExhibitorAlreadyDeActiveOrNot = async (companyId, exhibitorData) => {
    const _query = `
    SELECT
        id
    FROM
        user
    WHERE
        id = ? AND 
        companies_id = ? AND
        role = ? AND
        is_user_active = ${0};
    `;

    const _values = [
        exhibitorData.id,
        companyId,
        'exhibitor'
    ]

    try {
        const [result] = await pool.query(_query, _values);
        if (result.length > 0) {
            return true;
        }
        return false
    } catch (error) {
        // console.log('🚀 ~ userLoginQuery ~ error:', error);
        return Promise.reject(
            setRejectMessage(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                'operation_failed'
            )
        );
    }
}


const deleteUserInfoQuery = async (exhibitorData) => {

    const _query = `
        UPDATE 
            user
        SET 
            is_user_active = ${0}
        WHERE 
            id = ?;
    `;

    try {
        const [result] = await pool.query(_query, exhibitorData.id);
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
 * @description This function is used to delete exhibitor
 */
const deleteExhibitorData = async (authData, exhibitorData) => {
    try {
        const companyId = await getExhibitorCompanyQuery(authData);
        if (!_.isNil(companyId)) {
            const isExhibitorExist = await checkExhibitorAlreadyDeActiveOrNot(companyId, exhibitorData);
            if (isExhibitorExist) {
                return Promise.reject(
                    setRejectMessage(API_STATUS_CODE.BAD_REQUEST, "User has already de-active")
                )
            }
            const isUserDelete = await deleteUserInfoQuery(exhibitorData);
            if (isUserDelete) {
                return Promise.resolve({
                    status: 'success',
                    message: 'User deleted successfully'
                });
            }

        }
    } catch (error) {
        // console.log("🚀 ~ deleteExhibitorData ~ error:", error)
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.INTERNAL_SERVER_ERROR, "Internal Server Error")
        );
    }
}

module.exports = {
    deleteExhibitorData
}