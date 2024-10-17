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

const { pool } = require("../../../database/db");
const { setRejectMessage } = require("../../common/set-reject-message");
const { API_STATUS_CODE } = require("../../consts/error-status");


const updateUserInfoQuery = (bodyData, userData) => {
    const tableName = [];
    if (userData.role === 'visitor') {
        tableName.push('visitors');
    }
    else {
        tableName.push('user');
    }

    let _query = `UPDATE ${tableName} SET `;
    const _values = [];

    if (bodyData.firstName) {
        _query += 'f_name = ? ';
        _values.push(bodyData.firstName);
    }

    if (bodyData.lastName) {
        if (_values.length > 0) {
            _query += ', ';
        }
        _query += 'l_name = ? ';
        _values.push(bodyData.lastName);
    }
    if (bodyData.email) {
        if (_values.length > 0) {
            _query += ', ';
        }
        _query += 'email = ? ';
        _values.push(bodyData.email);
    }

    if (bodyData.contact) {
        if (_values.length > 0) {
            _query += ', ';
        }
        _query += 'contact_no = ? ';
        _values.push(bodyData.contact);
    }

    if (bodyData.position) {
        if (_values.length > 0) {
            _query += ', ';
        }
        _query += 'position = ? ';
        _values.push(bodyData.position);
    }

    if (userData.role === 'system_admin') {

        if (bodyData.role) {
            if (_values.length > 0) {
                _query += ', ';
            }
            _query += 'role = ? ';
            _values.push(bodyData.role);
        }
    }

    if (_values.length > 0) {
        _query += ', updated_at = ? ';
        _values.push(bodyData.updated_at);
    }

    _query += 'WHERE id  =?';
    _values.push(userData.id);

    return [_query, _values];
};

const updatePersonalInfo = async (bodyData, userData) => {
    const epochTimestamp = Math.floor(new Date().getTime() / 1000);

    bodyData = { ...bodyData, updated_at: epochTimestamp }
    try {
        const [_query, values] = await updateUserInfoQuery(bodyData, userData);
        const [isUpdateUser] = await pool.query(_query, values);
        if (isUpdateUser.affectedRows > 0) {
            return Promise.resolve();
        } else {
            return Promise.reject(
                setRejectMessage(API_STATUS_CODE.BAD_REQUEST, "Failed to update user information")
            )
        }
    } catch (error) {
        // console.log("🚀 ~ updateUserInfo ~ error:", error)
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.INTERNAL_SERVER_ERROR, "Internal Server Error")
        )
    }
};


module.exports = {
    updatePersonalInfo
}