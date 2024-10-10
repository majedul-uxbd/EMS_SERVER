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

const _ = require("lodash");
const { pool } = require("../../../database/db");
const { setRejectMessage } = require("../../common/set-reject-message");
const { API_STATUS_CODE } = require("../../consts/error-status");


const getNumberOfRowsQuery = async (userData, paginationData) => {
    let _query = `
    SELECT count(*) AS totalRows
    FROM
        user
    LEFT JOIN
        companies
    ON companies.id = user.companies_id
    WHERE
        companies.is_active = ${1}

    `;

    if (userData.role === 'exhibitor' || userData.role === 'exhibitor_admin') {
        _query += ` AND user.role IN (?, 'exhibitor_admin')`;
    } else if (userData.role === 'organizer') {
        _query += ` AND user.role = ?`;
    }

    const values = [userData.role, paginationData.itemsPerPage, paginationData.offset];


    try {
        const [result] = await pool.query(_query, values);
        return Promise.resolve(result);
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

const getUserDataQuery = async (userData, paginationData) => {
    let _query = `
    SELECT
        user.id,
        user.f_name,
        user.l_name,
        user.email,
        user.contact_no,
        companies.name AS company_name,
        companies.website_link AS company_website_link,
        companies.address AS company_address,
        companies.email AS company_email,
        user.position,
        user.role,
        user.profile_img,
        user.is_user_active,
        user.created_at,
        user.updated_at
    FROM
        user
    LEFT JOIN
        companies
    ON companies.id = user.companies_id
    WHERE
        companies.is_active = ${1}
    `;

    if (userData.role === 'exhibitor' || userData.role === 'exhibitor_admin') {
        _query += ` AND user.role IN (?, 'exhibitor_admin')`;
    } else if (userData.role === 'organizer') {
        _query += ` AND user.role = ?`;
    }

    _query += ` LIMIT ? OFFSET ?`;

    const values = [userData.role, paginationData.itemsPerPage, paginationData.offset];

    // return
    try {
        const [result] = await pool.query(_query, values);
        return Promise.resolve(result);
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

const getAllUserTableData = async (userData, paginationData) => {
    try {
        const totalRows = await getNumberOfRowsQuery(userData, paginationData);
        const result = await getUserDataQuery(userData, paginationData);

        return Promise.resolve({
            metadata: {
                totalRows: totalRows,
            },
            data: result
        });
    } catch (error) {
        // console.log("🚀 ~ getAllUserTableData ~ error:", error)
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.INTERNAL_SERVER_ERROR, 'Internal server error')
        );

    }
}

module.exports = {
    getAllUserTableData
}