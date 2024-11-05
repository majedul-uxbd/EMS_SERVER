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

const bcrypt = require("bcrypt");
const { API_STATUS_CODE } = require("../../consts/error-status");
const { pool } = require("../../../database/db");
const { format } = require('date-fns');

const { setRejectMessage } = require("../../common/set-reject-message");


const checkDuplicateEmail = async (email) => {
    const _query = `
    SELECT 
        email
    FROM
        user
    WHERE
        email = ?;
`;

    const values = [
        email
    ];

    try {
        const [result] = await pool.query(_query, values);
        if (result.length > 0) {
            return true;
        }
        return false;
    } catch (error) {
        // console.log("🚀 ~ userLoginQuery ~ error:", error)
        return Promise.reject(
            setRejectMessage(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                'operation_failed'
            )
        );
    }
};

const insertCompanyDataQuery = async (companyData) => {
    const query = `
	INSERT INTO
        companies
        (
            name,
            website_link,
            address,
            email,
            created_at
        )
	VALUES (?,?,?,?,?);
	`;

    const values = [
        companyData.companyName,
        companyData.website_link,
        companyData.address,
        companyData.email,
        companyData.createdAt
    ];

    try {
        const [result] = await pool.query(query, values);
        if (result.affectedRows > 0) {
            return true;
        }
        return false;
    } catch (error) {
        // console.log("🚀 ~ userLoginQuery ~ error:", error)
        return Promise.reject(
            setRejectMessage(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                'operation_failed'
            )
        );
    }
};

const addCompanyData = async (companyData) => {
    const createdAt = new Date();

    try {
        companyData = { ...companyData, createdAt: createdAt };

        const insertedData = await insertCompanyDataQuery(companyData);
        if (insertedData) {
            return Promise.resolve({
                status: 'success',
                message: 'Company created successfully'
            })
        }
    } catch (error) {
        // console.log("🚀 ~ addUser ~ error:", error)
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.INTERNAL_SERVER_ERROR, 'Internal Server Error'))
    }
}

module.exports = {
    addCompanyData
}