/**
 * @author Md. Majedul Islam <https://github.com/majedul-uxbd> 
 * Software Engineer,
 * Ultra-X BD Ltd.
 *
 * @copyright All right reserved Majedul
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
        return res.status(API_STATUS_CODE.BAD_REQUEST).send({
            status: "failed",
            message: "Operation failed",
        });
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
        return res.status(API_STATUS_CODE.BAD_REQUEST).send({
            status: "failed",
            message: "Operation failed",
        });
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
        return res.status(API_STATUS_CODE.BAD_REQUEST).send({
            status: "failed",
            message: "Operation failed",
        });
    }
}


const activeCompanyInfo = async (companyData) => {
    // console.log("🚀 ~ deleteUserInfo ~ userData:", userData)
    try {
        const isCompanyAvailable = await checkCompanyIdValidityQuery(companyData);
        if (isCompanyAvailable) {
            const isCompanyActive = await activeCompanyInfoQuery(companyData);
            if (isCompanyActive) {
                const isUserActivated = await enableUserOfTheCompany(companyData);
                return Promise.resolve({
                    status: "success",
                    message: "Company activated successfully",
                    active_user: " Exhibitor admin is now active"
                });
            } else {
                return Promise.reject(
                    setRejectMessage(API_STATUS_CODE.BAD_REQUEST, "Company has already active")
                )
            }
        }
        else {
            return Promise.reject(
                setRejectMessage(API_STATUS_CODE.BAD_REQUEST, "Company has already active")
            )
        }
    } catch (error) {
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.INTERNAL_SERVER_ERROR, "Internal Server Error")
        );
    }
}

module.exports = {
    activeCompanyInfo
}