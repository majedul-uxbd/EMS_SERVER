/**
 * @author Md. Majedul Islam <https://github.com/majedul-uxbd>
 * Software Engineer,
 * Ultra-X BD Ltd.
 *
 * @copyright All right reserved Md. Majedul Islam
 *
 * @description
 *
 */
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const { pool } = require('../../../database/db');
const { API_STATUS_CODE } = require('../../consts/error-status');
const {
    setRejectMessage,
} = require('../../common/set-reject-message');

const userLoginQuery = async (email) => {
    const query = `
	SELECT
        id,
		f_name,
        l_name,
        email,
        password,
        contact_no,
        position,
        role,
        profile_img
	FROM
		user
	WHERE
		email = ? AND is_user_active = ${1};
	`;
    const values = [email];

    try {
        const [result] = await pool.query(query, values);
        // console.log("🚀 ~ userLoginQuery ~ result:", result)
        if (result.length > 0) {
            return Promise.resolve(result[0]);
        } return false;
    } catch (error) {
        // console.log("🚀 ~ userLoginQuery ~ error111:", error)
        return Promise.reject(
            setRejectMessage(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                'Operation failed'
            )
        );
    }
};

const visitorsLoginQuery = async (email) => {
    const query = `
	SELECT
        id,
		f_name,
        l_name,
        email,
        password,
        contact_no,
        position,
        role,
        profile_img
	FROM
		visitors
	WHERE
		email = ? AND is_user_active = ${1};
	`;
    const values = [email];

    try {
        const [result] = await pool.query(query, values);
        // console.log("🚀 ~ visitorsLoginQuery ~ result:", result)
        if (result.length > 0) {
            return Promise.resolve(result[0]);
        } return false;
    } catch (error) {
        // console.log("🚀 ~ userLoginQuery ~ error:", error)
        return Promise.reject(
            setRejectMessage(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                'Operation failed'
            )
        );
    }
};

const generateToken = (userInfo) => {
    const token = jwt.sign(
        {
            id: userInfo.id,
            email: userInfo.email,
            role: userInfo.role,
        },
        process.env.SECRET_KEY,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRE,
        }
    );

    return token;
};

const userLogin = async (user) => {
    let userInfo;

    if (!user.email || !user.password) {
        Promise.reject(
            setRejectMessage(
                API_STATUS_CODE.FORBIDDEN,
                'Invalid email or password'
            )
        );
    }

    try {
        userInfo = await userLoginQuery(user.email);
        // console.log("🚀 ~ userLogin ~ userInfo:", userInfo)
        if (userInfo === false) {
            userInfo = await visitorsLoginQuery(user.email);
        }
    } catch (error) {
        // console.log("🚀 ~ userLogin ~ error:", error)
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.BAD_REQUEST, "Invalid email or password")
        );
    }
    // console.log("🚀 ~ userLogin ~ userInfo:", userInfo)
    if (!userInfo) {
        return Promise.reject(
            setRejectMessage(
                API_STATUS_CODE.BAD_REQUEST,
                'Invalid email or password'
            )
        );
    }

    let isPasswordCorrect;
    try {
        isPasswordCorrect = await bcrypt.compare(
            user.password,
            userInfo.password
        ); //compare user passwords
    } catch (error) {
        // console.log("🚀 ~ userLogin ~ error:", error)
        return Promise.reject(
            setRejectMessage(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                'Operation failed'
            )
        );
    }

    if (!isPasswordCorrect) {
        return Promise.reject(
            setRejectMessage(
                API_STATUS_CODE.BAD_REQUEST,
                'Invalid email or password'
            )
        );
    }

    const token = generateToken(userInfo);
    return Promise.resolve({
        message: 'User successfully login',
        token: token,
        user: {
            id: userInfo.id,
            firstName: userInfo.f_name,
            lastName: userInfo.l_name,
            email: userInfo.email,
            contact: userInfo.contact_no,
            position: userInfo.position,
            role: userInfo.role,
            profile_img: userInfo.profile_img,
        },
    });
};
module.exports = {
    userLogin,
};
