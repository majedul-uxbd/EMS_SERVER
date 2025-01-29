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
const { setServerResponse } = require('../../common/set-server-response');

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
        is_user_active,
        profile_img
	FROM
		user
	WHERE
		email = ?;
	`;
    const values = [email];

    try {
        const [result] = await pool.query(query, values);
        // console.log("🚀 ~ userLoginQuery ~ result:", result)
        if (result.length > 0) {
            if (result[0].is_user_active === 1) {
                return Promise.resolve(result[0]);
            } else {
                return 0;
            }
        } return false;
    } catch (error) {
        // console.log("🚀 ~ userLoginQuery ~ error111:", error)
        return Promise.reject(error);
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
        return Promise.reject(error);
    }
};

/**
 * @description This function will generate a unique user token
 */
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


/**
 * @description This function is used to login the user
 */
const userLogin = async (user) => {
    const lgKey = user.lg;
    let userInfo;

    if (!user.email || !user.password) {
        Promise.reject(
            setServerResponse(
                API_STATUS_CODE.BAD_REQUEST,
                'invalid_email_or_password',
                lgKey,
            )
        );
    }

    try {
        userInfo = await userLoginQuery(user.email);
        if (userInfo === false) {
            userInfo = await visitorsLoginQuery(user.email);
        }
    } catch (error) {
        // console.log("🚀 ~ userLogin ~ error:", error)
        return Promise.reject(
            setServerResponse(
                API_STATUS_CODE.BAD_REQUEST,
                'invalid_email_or_password',
                lgKey,
            )
        );
    }
    // console.log("🚀 ~ userLogin ~ userInfo:", userInfo)
    if (userInfo === 0) {
        return Promise.reject(
            setServerResponse(
                API_STATUS_CODE.BAD_REQUEST,
                'no_user_found_or_user_is_not_active',
                lgKey,
                userInfo
            )
        );
    }
    if (!userInfo) {
        return Promise.reject(
            setServerResponse(
                API_STATUS_CODE.BAD_REQUEST,
                'invalid_email_or_password',
                lgKey,
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
            setServerResponse(
                API_STATUS_CODE.BAD_REQUEST,
                'operation_failed',
                lgKey,
            )
        );
    }

    if (!isPasswordCorrect) {
        return Promise.reject(
            setServerResponse(
                API_STATUS_CODE.BAD_REQUEST,
                'invalid_email_or_password',
                lgKey,
            )
        );
    }

    const token = generateToken(userInfo);
    user = {
        token: token,
        id: userInfo.id,
        firstName: userInfo.f_name,
        lastName: userInfo.l_name,
        email: userInfo.email,
        contact: userInfo.contact_no,
        position: userInfo.position,
        role: userInfo.role,
        profile_img: userInfo.profile_img,
    }

    return Promise.resolve(
        setServerResponse(
            API_STATUS_CODE.OK,
            'user_logged_in_successfully',
            lgKey,
            user
        )
    );
};
module.exports = {
    userLogin,
};
