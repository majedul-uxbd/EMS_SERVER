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

const _ = require('lodash')
const jwt = require('jsonwebtoken');
const { API_STATUS_CODE } = require('../../consts/error-status');
const bcrypt = require("bcrypt");
const { pool } = require('../../../database/db');
const { setServerResponse } = require('../../common/set-server-response');


const updateUserPassword = async (bodyData) => {
    const _query1 = `
        UPDATE
            user
        SET
            password = ?,
            updated_at = UTC_TIMESTAMP()
        WHERE
            email = ?;
    `;

    const _query2 = `
        UPDATE
            visitors
        SET
            password = ?,
            updated_at = UTC_TIMESTAMP()
        WHERE
            email = ?;
    `;

    const _values = [
        bodyData.password,
        bodyData.email,
    ]

    try {
        const [result1] = await pool.query(_query1, _values);
        if (result1.affectedRows > 0) {
            return true;
        }
        const [result2] = await pool.query(_query2, _values);
        if (result2.affectedRows > 0) {
            return true;
        }
        return false;
    } catch (error) {
        return Promise.reject(error);
    }
}


/**
 * @description This function is used to reset user password
 */
const resetUserPassword = async (bodyData) => {
    const lgKey = bodyData.lg;
    let email;
    let password;
    try {
        if (!_.isNil(bodyData.token)) {
            jwt.verify(bodyData.token, process.env.SECRET_KEY, (err, user) => {
                if (err) {
                    return Promise.reject(
                        setServerResponse(
                            API_STATUS_CODE.UNAUTHORIZED,
                            'invalid_token',
                            lgKey
                        )
                    );
                }
                email = user.email;
            })
        } else if (!_.isNil(bodyData.email)) {
            email = bodyData.email;
        } else {
            return Promise.reject(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'failed_to_update_password',
                    lgKey
                )
            )
        }
        password = await bcrypt.hash(bodyData.password, 10);
        bodyData = { email: email, password: password };

        const isUpdated = await updateUserPassword(bodyData);
        if (isUpdated) {
            return Promise.resolve(
                setServerResponse(
                    API_STATUS_CODE.OK,
                    'password_reset_successfully',
                    lgKey
                )
            )
        } else {
            return Promise.reject(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'failed_to_update_password',
                    lgKey
                )
            )
        }
    } catch (error) {
        return Promise.reject(
            setServerResponse(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                'internal_server_error',
                lgKey,
            ))
    }
}

module.exports = {
    resetUserPassword
}