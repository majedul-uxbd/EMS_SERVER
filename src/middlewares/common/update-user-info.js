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

const { pool } = require("../../../database/db");
const { setServerResponse } = require("../../common/set-server-response");
const { API_STATUS_CODE } = require("../../consts/error-status");

const checkUserIdValidityQuery = async (bodyData) => {
    const tableName = [];
    if (bodyData.role === 'visitor') {
        tableName.push('visitors');
    }
    else {
        tableName.push('user');
    }

    const _query = `
    SELECT
        id
    FROM
        ${tableName}
    WHERE
        id = ? AND 
        is_user_active = ${1};
    `;
    try {
        const [result] = await pool.query(_query, bodyData.id);
        if (result.length > 0) {
            return true;
        }
        return false;
    } catch (error) {
        // console.log("🚀 ~ getUserData ~ error:", error)
        return Promise.reject(error);
    }
}

const checkDuplicateExhibitorAdmin = async (bodyData) => {
    const _query = `
    SELECT 
        role
    FROM
        user
    WHERE
        role = ?;
`;

    const values = [
        bodyData.role
    ];

    try {
        const [result] = await pool.query(_query, values);
        if (result.length > 0) {
            return true;
        }
        return false;
    } catch (error) {
        // console.log("🚀 ~ userLoginQuery ~ error:", error)
        return Promise.reject(error);
    }
};

const updateUserInfoQuery = (bodyData, authData) => {
    const tableName = [];
    if (bodyData.role === 'visitor') {
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

    if (bodyData.company) {
        if (_values.length > 0) {
            _query += ', ';
        }
        _query += 'company = ? ';
        _values.push(bodyData.company);
    }

    if (bodyData.position) {
        if (_values.length > 0) {
            _query += ', ';
        }
        _query += 'position = ? ';
        _values.push(bodyData.position);
    }

    if (authData.role === 'system_admin') {

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
    _values.push(bodyData.id);

    return [_query, _values];
};

/**
 * @description This function is used to update user information by System Admin 
 */
const updateUserInfo = async (bodyData, authData) => {
    const lgKey = bodyData.lg;
    const updatedAt = new Date();
    bodyData = { ...bodyData, updated_at: updatedAt }
    try {
        if (bodyData.role === 'exhibitor_admin') {
            const isDuplicateExhibitorAdmin = await checkDuplicateExhibitorAdmin(bodyData);
            if (isDuplicateExhibitorAdmin) {
                return Promise.reject(
                    setServerResponse(
                        API_STATUS_CODE.BAD_REQUEST,
                        'exhibitor_Admin_role_has_already_exist',
                        lgKey
                    )
                );
            }
        }
        const isUserAvailable = await checkUserIdValidityQuery(bodyData);
        if (isUserAvailable) {
            const [_query, values] = await updateUserInfoQuery(bodyData, authData);
            const [isUpdateUser] = await pool.query(_query, values);
            if (isUpdateUser.affectedRows > 0) {
                return Promise.resolve(
                    setServerResponse(
                        API_STATUS_CODE.OK,
                        'user_updated_successfully',
                        lgKey
                    )
                );
            } else {
                return Promise.reject(
                    setServerResponse(
                        API_STATUS_CODE.BAD_REQUEST,
                        'failed_to_update_user_information',
                        lgKey
                    )
                )
            }
        } else {
            return Promise.reject(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'cannot_update_inactive_user_information',
                    lgKey
                )
            )
        }
    } catch (error) {
        // console.log("🚀 ~ updateUserInfo ~ error:", error)
        return Promise.reject(
            setServerResponse(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                'internal_server_error',
                lgKey
            )
        )
    }
};


module.exports = {
    updateUserInfo
}