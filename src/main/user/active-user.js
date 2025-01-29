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


const checkIfUserActiveQuery = async (bodyData) => {
    const _query = `
    SELECT
        id
    FROM
        user
    WHERE
        id = ?;
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

const getIsCompanyActiveOrNotQuery = async (bodyData) => {
    const _query = `
    SELECT
        company.is_active
    FROM
        companies AS company
    LEFT JOIN
        user
    ON
        company.id = user.companies_id
    WHERE
        user.id = ?;
    `;

    try {
        const [result] = await pool.query(_query, bodyData.id);
        if (result[0].is_active === 1) {
            return true;
        }
        return false;
    } catch (error) {
        return Promise.reject(error);
    }
}


const activeUserQuery = async (bodyData) => {
    const _query = `
    UPDATE
        user
    SET
        is_user_active = ${1}
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
        return Promise.reject(error);
    }
};

/**
 * @description This function is used to active user
 */
const activeUser = async (bodyData) => {
    const lgKey = bodyData.lg;
    try {
        const isExist = await checkIfUserActiveQuery(bodyData);
        if (!isExist) {
            return Promise.resolve(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'user_not_found',
                    lgKey,
                )
            )
        }
        const isCompanyActive = await getIsCompanyActiveOrNotQuery(bodyData);
        if (isCompanyActive) {
            const activeUser = await activeUserQuery(bodyData);
            if (activeUser) {
                return Promise.resolve(
                    setServerResponse(
                        API_STATUS_CODE.OK,
                        'user_is_activated_successfully',
                        lgKey,
                    )
                )
            } else {
                return Promise.reject(
                    setServerResponse(
                        API_STATUS_CODE.BAD_REQUEST,
                        'failed_to_active_user',
                        lgKey,
                    )
                );
            }
        } else {
            return Promise.reject(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'invalid_company_or_company_is_not_active',
                    lgKey,
                )
            );
        }
    } catch (error) {
        // console.log('🚀 ~ file: active-user.js:100 ~ activeUser ~ error:', error);
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
    activeUser
}