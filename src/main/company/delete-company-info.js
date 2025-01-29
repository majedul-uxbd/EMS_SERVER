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
        is_active = ${1};
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


const deleteCompanyInfoQuery = async (companyData) => {

    const _query = `
        UPDATE 
            companies
        SET 
            is_active = ${0}
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

const disableUserOfTheCompany = async (companyData) => {
    const _query = `
    UPDATE 
        user
    SET 
        is_user_active = ${0}
    WHERE 
        companies_id = ?;
    `;

    try {
        const [result] = await pool.query(_query, companyData.id);
        if (result.affectedRows > 0) {
            return true;
        }
        return false;
    } catch (error) {
        // console.log("🚀 ~ getUserData ~ error:", error)
        return Promise.reject(error);
    }
}


/**
 * @description Checks if the user is a system admin trying to delete his own company.
 */
const isSystemAdminDeletingOwnCompany = async (authData, companyData) => {
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
        if (result[0].companies_id == companyData.id) {
            return true;
        }
        return false;
    } catch (error) {
        return Promise.reject(error);
    }
};


/**
 * @description This function will delete company information
 */
const deleteCompanyInfo = async (companyData, authData) => {
    const lgKey = companyData.lg;
    try {
        const isCompanyAvailable = await checkCompanyIdValidityQuery(companyData);
        if (isCompanyAvailable) {
            if (authData.role === 'system_admin') {
                const isMatch = await isSystemAdminDeletingOwnCompany(authData, companyData);
                if (isMatch) {
                    return Promise.reject(
                        setServerResponse(
                            API_STATUS_CODE.BAD_REQUEST,
                            'system_admin_cannot_delete_their_own_company',
                            lgKey,
                        )
                    );
                }
            }
            const isCompanyDelete = await deleteCompanyInfoQuery(companyData);
            if (isCompanyDelete) {
                const isUserDeactivated = await disableUserOfTheCompany(companyData);
                return Promise.resolve(
                    setServerResponse(
                        API_STATUS_CODE.OK,
                        'company_deactivated_successfully',
                        lgKey,
                    )
                );
            } else {
                return Promise.reject(
                    setServerResponse(
                        API_STATUS_CODE.BAD_REQUEST,
                        'company_not_found',
                        lgKey,
                    )
                )
            }
        }
        else {
            return Promise.reject(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'company_not_found',
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
    deleteCompanyInfo
}