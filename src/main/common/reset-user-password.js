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
const { setRejectMessage } = require('../../common/set-reject-message');
const { API_STATUS_CODE } = require('../../consts/error-status');
const bcrypt = require("bcrypt");
const { pool } = require('../../../database/db');


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
        return Promise.reject(
            setRejectMessage(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                'Operation failed'
            )
        );
    }
}


/**
 * @description This function is used to reset user password
 */
const resetUserPassword = async (bodyData) => {
    let email;
    let password;
    try {
        if (!_.isNil(bodyData.token)) {
            jwt.verify(bodyData.token, process.env.SECRET_KEY, (err, user) => {
                if (err) {
                    return Promise.reject(
                        setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Invalid token')
                    );
                }
                email = user.email;
            })
        } else if (!_.isNil(bodyData.email)) {
            email = bodyData.email;
        } else {
            return Promise.reject(
                setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Failed to update password')
            )
        }
        password = await bcrypt.hash(bodyData.password, 10);
        bodyData = { email: email, password: password };

        const isUpdated = await updateUserPassword(bodyData);
        if (isUpdated) {
            return Promise.resolve({
                status: 'success',
                message: 'Password reset successfully'
            })
        } else {
            return Promise.reject(
                setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Failed to update password')
            )
        }
    } catch (error) {
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.INTERNAL_SERVER_ERROR, 'Internal Server Error')
        )
    }
}

module.exports = {
    resetUserPassword
}