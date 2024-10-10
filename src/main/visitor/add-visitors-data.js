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
const { setRejectMessage } = require("../../common/set-reject-message");


const checkDuplicateEmail = async (email) => {
    const _query = `
    SELECT 
        email
    FROM
        visitors
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

const insertUserQuery = async (visitor) => {
    const query = `
	INSERT INTO
        visitors
        (
            f_name,
            l_name,
            email,
            password,
            contact_no,
            company,
            position,
            role,
            profile_img,
            created_at
        )
	VALUES (?,?,?,?,?,?,?,?,?,?);
	`;

    const values = [
        visitor.firstName,
        visitor.lastName,
        visitor.email,
        visitor.password,
        visitor.contact,
        visitor.company,
        visitor.position,
        visitor.role,
        visitor.profileImg,
        visitor.createdAt
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

const addVisitor = async (visitor) => {
    const epochTimestamp = Math.floor(new Date().getTime() / 1000);

    let _password;
    try {
        const isDuplicateEmail = await checkDuplicateEmail(visitor.email);
        if (isDuplicateEmail) {
            return Promise.reject(
                setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Email has already exist')
            );
        }
        _password = await bcrypt.hash(visitor.password, 10);
        const visitorData = { ...visitor, password: _password, createdAt: epochTimestamp };


        const insertedData = await insertUserQuery(visitorData);
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
    addVisitor
}