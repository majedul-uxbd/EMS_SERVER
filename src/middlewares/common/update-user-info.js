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
const { setRejectMessage } = require("../../common/set-reject-message");
const { API_STATUS_CODE } = require("../../consts/error-status");
const { format } = require('date-fns');



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
        return res.status(API_STATUS_CODE.BAD_REQUEST).send({
            status: "failed",
            message: "Operation failed",
        });
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
        return Promise.reject(
            setRejectMessage(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                'operation_failed'
            )
        );
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

const updateUserInfo = async (bodyData, authData) => {
    const updatedAt = new Date();

    bodyData = { ...bodyData, updated_at: updatedAt }
    try {
        if (bodyData.role === 'exhibitor_admin') {
            const isDuplicateExhibitorAdmin = await checkDuplicateExhibitorAdmin(bodyData);
            if (isDuplicateExhibitorAdmin) {
                return Promise.reject(
                    setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Exhibitor Admin role has already exist')
                );
            }
        }
        const isUserAvailable = await checkUserIdValidityQuery(bodyData);
        if (isUserAvailable) {
            const [_query, values] = await updateUserInfoQuery(bodyData, authData);
            const [isUpdateUser] = await pool.query(_query, values);
            if (isUpdateUser.affectedRows > 0) {
                return Promise.resolve();
            } else {
                return Promise.reject(
                    setRejectMessage(API_STATUS_CODE.BAD_REQUEST, "Failed to update user information")
                )
            }
        } else {
            return Promise.reject(
                setRejectMessage(API_STATUS_CODE.BAD_REQUEST, "Can't update inactive user information")
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
    updateUserInfo
}