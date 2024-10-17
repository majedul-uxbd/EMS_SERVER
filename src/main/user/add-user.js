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

const bcrypt = require("bcrypt");
const { API_STATUS_CODE } = require("../../consts/error-status");
const { pool } = require("../../../database/db");
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

const insertUserQuery = async (user) => {
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
            created_at
        )
	VALUES (?,?,?,?,?,?,?,?,?,?);
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
        user.createdAt
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

const addUser = async (user) => {
    const epochTimestamp = Math.floor(new Date().getTime() / 1000);

    let _password;
    try {
        const isDuplicateEmail = await checkDuplicateEmail(user.email);
        if (isDuplicateEmail) {
            return Promise.reject(
                setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Email has already exist')
            );
        }
        _password = await bcrypt.hash(user.password, 10);
        const userData = { ...user, password: _password, createdAt: epochTimestamp };


        const insertedData = await insertUserQuery(userData);
        if (insertedData) {
            return Promise.resolve('User created successfully')
        }
    } catch (error) {
        // console.log("🚀 ~ addUser ~ error:", error)
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.INTERNAL_SERVER_ERROR, 'Internal Server Error'))
    }
}

module.exports = {
    addUser
}