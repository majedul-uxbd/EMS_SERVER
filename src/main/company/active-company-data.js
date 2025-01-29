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

const checkCompanyIdValidityQuery = async (companyData) => {

    const _query = `
    SELECT
        id
    FROM
        companies
    WHERE
        id = ? AND 
        is_active = ${0};
    `;
    try {
        const [result] = await pool.query(_query, companyData.id);
        if (result.length > 0) {
            return true;
        }
        return false;
    } catch (error) {
        // console.log("🚀 ~ getUserData ~ error:", error)
        return Promise.reject(error);
    }
}


const activeCompanyInfoQuery = async (companyData) => {

    const _query = `
        UPDATE 
            companies
        SET 
            is_active = ${1}
        WHERE 
            id = ?;
    `;

    try {
        const [result] = await pool.query(_query, companyData.id);
        if (result.affectedRows === 1) {
            return true;
        }
        return false;
    } catch (error) {
        // console.log("🚀 ~ getUserData ~ error:", error)
        return Promise.reject(error);
    }
}

const enableUserOfTheCompany = async (companyData) => {
    const _query = `
    UPDATE 
        user
    SET 
        is_user_active = ${1}
    WHERE 
        companies_id = ? AND
        role = ?;
    `;

    const values = [
        companyData.id,
        'exhibitor_admin'
    ]

    try {
        const [result] = await pool.query(_query, values);
        if (result.affectedRows > 0) {
            return Promise.resolve(result);
        }
        return false;
    } catch (error) {
        // console.log("🚀 ~ getUserData ~ error:", error)
        return Promise.reject(error);
    }
}

/**
 * @description This function will active company account
 */
const activeCompanyInfo = async (companyData) => {
    const lgKey = companyData.lg;
    try {
        const isCompanyAvailable = await checkCompanyIdValidityQuery(companyData);
        if (isCompanyAvailable) {
            const isCompanyActive = await activeCompanyInfoQuery(companyData);
            if (isCompanyActive) {
                const isUserActivated = await enableUserOfTheCompany(companyData);
                const result = {
                    active_user: isUserActivated
                }
                return Promise.resolve(
                    setServerResponse(
                        API_STATUS_CODE.OK,
                        'company_activated_successfully',
                        lgKey,
                        result
                    )
                );
            } else {
                return Promise.reject(
                    setServerResponse(
                        API_STATUS_CODE.BAD_REQUEST,
                        'company_has_already_active',
                        lgKey
                    )
                )
            }
        }
        else {
            return Promise.reject(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'company_has_already_active',
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
    activeCompanyInfo
}