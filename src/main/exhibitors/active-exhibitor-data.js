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
const { API_STATUS_CODE } = require("../../consts/error-status");
const { setServerResponse } = require("../../common/set-server-response");


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
        return Promise.reject(error);
    }
}

const checkUserExistQuery = async (companyId, exhibitorData) => {
    const _query = `
    SELECT
        id
    FROM 
        user
    WHERE
        id = ? AND
        companies_id = ?;
    `;

    const _values = [
        exhibitorData.id,
        companyId
    ]

    try {
        const [result] = await pool.query(_query, _values);
        if (result.length > 0) {
            return Promise.resolve(true);
        } return Promise.resolve(false);
    } catch (error) {
        // console.log('🚀 ~ userLoginQuery ~ error:', error);
        return Promise.reject(error);
    }
}

const checkExhibitorAlreadyActiveOrNot = async (companyId, exhibitorData) => {
    const _query = `
    SELECT
        id
    FROM
        user
    WHERE
        id = ? AND 
        companies_id = ? AND
        role = ? AND
        is_user_active = ${1};
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
        return Promise.reject(error);
    }
}


const activeUserInfoQuery = async (exhibitorData) => {

    const _query = `
        UPDATE 
            user
        SET 
            is_user_active = ${1}
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
        return Promise.reject(error);
    }
}

/**
 * @description This function is used to active exhibitor
 */
const activeExhibitorData = async (authData, exhibitorData) => {
    const lgKey = exhibitorData.lg;

    try {
        const companyId = await getExhibitorCompanyQuery(authData);
        if (!_.isNil(companyId)) {
            const isUserExist = await checkUserExistQuery(companyId, exhibitorData);
            if (!isUserExist) {
                return Promise.reject(
                    setServerResponse(
                        API_STATUS_CODE.BAD_REQUEST,
                        'user_not_found',
                        lgKey
                    ))
            }
            const isExhibitorActive = await checkExhibitorAlreadyActiveOrNot(companyId, exhibitorData);
            if (isExhibitorActive) {
                return Promise.reject(
                    setServerResponse(
                        API_STATUS_CODE.BAD_REQUEST,
                        'user_is_already_active',
                        lgKey
                    ))
            }
            const isUserActive = await activeUserInfoQuery(exhibitorData);
            if (isUserActive) {
                return Promise.resolve(
                    setServerResponse(
                        API_STATUS_CODE.OK,
                        'user_is_activated_successfully',
                        lgKey
                    ));
            }

        }
    } catch (error) {
        // console.log('🚀 ~ file: active-exhibitor-data.js:124 ~ activeExhibitorData ~ error:', error);
        return Promise.reject(
            setServerResponse(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                'internal_server_error',
                lgKey,
            ));
    }
}

module.exports = {
    activeExhibitorData
}