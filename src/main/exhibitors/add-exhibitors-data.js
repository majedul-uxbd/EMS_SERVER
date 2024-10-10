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
const _ = require('lodash');
const { API_STATUS_CODE } = require("../../consts/error-status");
const { pool } = require("../../../database/db");
const { setRejectMessage } = require("../../common/set-reject-message");


const checkIsCompanyActive = async (id) => {
    const _query = `
    SELECT
        is_active
    FROM
        companies
    WHERE
        id = ?;
`;

    try {
        const [result] = await pool.query(_query, id);
        if (result.length > 0) {
            return Promise.resolve(result);
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


const checkDuplicateExhibitorAdmin = async (exhibitor) => {
    const _query = `
    SELECT 
        role
    FROM
        user
    WHERE
        companies_id = ? AND 
        role = ?;
`;

    const values = [
        exhibitor.companyId,
        'exhibitor_admin'
    ];

    try {
        const [result] = await pool.query(_query, values);
        if (result.length > 0) {
            if (result[0].role === exhibitor.role) {
                return true;
            }
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


const insertUserQuery = async (user, isCompanyActive) => {
    const is_user_active = [];
    if (isCompanyActive[0].is_active === 1) {
        is_user_active.push(1);
    } else {
        is_user_active.push(0);
    }
    const query = `
	INSERT INTO
        user
        (
            companies_id,
            f_name,
            l_name,
            email,
            password,
            contact_no,
            position,
            role,
            profile_img,
            is_user_active,
            created_at
        )
	VALUES (?,?,?,?,?,?,?,?,?,?,?);
	`;

    const values = [
        user.companyId,
        user.firstName,
        user.lastName,
        user.email,
        user.password,
        user.contact,
        user.position,
        user.role,
        user.profileImg,
        is_user_active,
        user.createdAt
    ];

    try {
        const [result] = await pool.query(query, _.flatten(values));
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

const addExhibitor = async (exhibitor) => {
    const epochTimestamp = Math.floor(new Date().getTime() / 1000);

    let _password;
    try {
        const isDuplicateEmail = await checkDuplicateEmail(exhibitor.email);
        const isDuplicateExhibitorAdmin = await checkDuplicateExhibitorAdmin(exhibitor);
        const isCompanyActive = await checkIsCompanyActive(exhibitor.companyId);
        console.log("🚀 ~ addExhibitor ~ isCompanyActive:", isCompanyActive)

        if (isDuplicateEmail) {
            return Promise.reject(
                setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Email has already exist')
            );
        }
        if (isDuplicateExhibitorAdmin) {
            return Promise.reject(
                setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Exhibitor Admin role has already exist')
            );
        }
        _password = await bcrypt.hash(exhibitor.password, 10);
        const visitorData = { ...exhibitor, password: _password, createdAt: epochTimestamp };

        const insertedData = await insertUserQuery(visitorData, isCompanyActive);
        if (insertedData) {
            return Promise.resolve()
        }
    } catch (error) {
        // console.log("🚀 ~ addUser ~ error:", error)
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.INTERNAL_SERVER_ERROR, 'Internal Server Error'))
    }
}

module.exports = {
    addExhibitor
}