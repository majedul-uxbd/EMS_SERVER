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
        return res.status(API_STATUS_CODE.BAD_REQUEST).send({
            status: "failed",
            message: "Operation failed",
        });
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
        return res.status(API_STATUS_CODE.BAD_REQUEST).send({
            status: "failed",
            message: "Operation failed",
        });
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
            return Promise.resolve(result);
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
        return res.status(API_STATUS_CODE.BAD_REQUEST).send({
            status: "failed",
            message: "Operation failed",
        });
    }
};


/**
 * @description This function will delete company information
 */
const deleteCompanyInfo = async (companyData, authData) => {
    // console.log("🚀 ~ deleteUserInfo ~ userData:", userData)
    try {
        const isCompanyAvailable = await checkCompanyIdValidityQuery(companyData);
        if (isCompanyAvailable) {
            if (authData.role === 'system_admin') {
                const isMatch = await isSystemAdminDeletingOwnCompany(authData, companyData);
                if (isMatch) {
                    return Promise.reject(
                        setRejectMessage(API_STATUS_CODE.FORBIDDEN, "System admin cannot delete their own company")
                    );
                }
            }
            const isCompanyDelete = await deleteCompanyInfoQuery(companyData);
            if (isCompanyDelete) {
                const isUserDeactivated = await disableUserOfTheCompany(companyData);
                return Promise.resolve({
                    status: "success",
                    message: "Company deleted successfully",
                });
            } else {
                return Promise.reject(
                    setRejectMessage(API_STATUS_CODE.BAD_REQUEST, "Company not found")
                )
            }
        }
        else {
            return Promise.reject(
                setRejectMessage(API_STATUS_CODE.BAD_REQUEST, "Company not found")
            )
        }
    } catch (error) {
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.INTERNAL_SERVER_ERROR, "Internal Server Error")
        );
    }
}

module.exports = {
    deleteCompanyInfo
}