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
const { setRejectMessage } = require("../../common/set-server-response");


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


const insertUserQuery = async (organizerData, isCompanyActive) => {
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
        organizerData.companyId,
        organizerData.firstName,
        organizerData.lastName,
        organizerData.email,
        organizerData.password,
        organizerData.contact,
        organizerData.position,
        organizerData.role,
        organizerData.profileImg,
        is_user_active,
        organizerData.createdAt
    ];

    try {
        const [result] = await pool.query(query, _.flatten(values));
        if (result.affectedRows > 0) {
            return true;
        }
        return false;
    } catch (error) {
        console.log("🚀 ~ userLoginQuery ~ error:", error)
        return Promise.reject(
            setRejectMessage(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                'operation_failed'
            )
        );
    }
};

const addOrganizerData = async (organizer) => {
    const createdAt = new Date();

    let _password;
    try {
        const isDuplicateEmail = await checkDuplicateEmail(organizer.email);
        const isCompanyActive = await checkIsCompanyActive(organizer.companyId);
        if (isDuplicateEmail) {
            return Promise.reject(
                setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Email has already exist')
            );
        }
        _password = await bcrypt.hash(organizer.password, 10);
        const organizerData = { ...organizer, password: _password, createdAt: createdAt };

        const insertedData = await insertUserQuery(organizerData, isCompanyActive);
        if (insertedData) {
            return Promise.resolve({
                status: 'success',
                message: 'Organizer created successfully'
            })
        }
    } catch (error) {
        console.log("🚀 ~ addUser ~ error:", error)
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.INTERNAL_SERVER_ERROR, 'Internal Server Error'))
    }
}

module.exports = {
    addOrganizerData
}