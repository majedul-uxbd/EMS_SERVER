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
const _ = require('lodash');
const { format } = require('date-fns');

const { setRejectMessage } = require("../../common/set-reject-message");
const { API_STATUS_CODE } = require("../../consts/error-status");


const getExhibitorCompanyQuery = async (authData) => {
    const _query = `
    SELECT
        companies_id
    FROM 
        user
    WHERE
        id = ?;
    `;

    try {
        const [result] = await pool.query(_query, authData.id);
        if (result.length > 0) {
            return Promise.resolve(result[0].companies_id);
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

const checkExhibitorIsExistOrNotQuery = async (companyId, authData) => {

    const _query = `
    SELECT
        id
    FROM
        user
    WHERE
        id = ? AND 
        companies_id = ? AND
        role IN (?, 'exhibitor_admin');
    `;

    const _values = [
        authData.id,
        companyId,
        authData.role,
    ]
    try {
        const [result] = await pool.query(_query, _values);
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


const updateUserInfoQuery = (exhibitorData, authData) => {

    let _query = `UPDATE user SET `;
    const _values = [];

    if (exhibitorData.firstName) {
        _query += 'f_name = ? ';
        _values.push(exhibitorData.firstName);
    }

    if (exhibitorData.lastName) {
        if (_values.length > 0) {
            _query += ', ';
        }
        _query += 'l_name = ? ';
        _values.push(exhibitorData.lastName);
    }
    if (exhibitorData.email) {
        if (_values.length > 0) {
            _query += ', ';
        }
        _query += 'email = ? ';
        _values.push(exhibitorData.email);
    }

    if (exhibitorData.contact) {
        if (_values.length > 0) {
            _query += ', ';
        }
        _query += 'contact_no = ? ';
        _values.push(exhibitorData.contact);
    }

    if (exhibitorData.position) {
        if (_values.length > 0) {
            _query += ', ';
        }
        _query += 'position = ? ';
        _values.push(exhibitorData.position);
    }

    if (_values.length > 0) {
        _query += ', updated_at = ? ';
        _values.push(exhibitorData.updated_at);
    }

    _query += 'WHERE id  =?';
    _values.push(authData.id);

    return [_query, _values];
};

/**
 * @description This function is used to update exhibitor own data
 */
const updateExhibitorData = async (exhibitorData, authData) => {
    const updatedAt = new Date();

    exhibitorData = { ...exhibitorData, updated_at: updatedAt }
    try {
        const companyId = await getExhibitorCompanyQuery(authData);
        if (!_.isNil(companyId)) {
            const isExhibitorExist = await checkExhibitorIsExistOrNotQuery(companyId, authData);
            if (isExhibitorExist) {
                const [_query, values] = await updateUserInfoQuery(exhibitorData, authData);
                const [isUpdateUser] = await pool.query(_query, values);
                if (isUpdateUser.affectedRows > 0) {
                    return Promise.resolve({
                        status: 'success',
                        message: 'User info updated successfully'
                    });
                } else {
                    return Promise.reject(
                        setRejectMessage(API_STATUS_CODE.BAD_REQUEST, "Failed to update user")
                    )
                }
            } else {
                return Promise.reject(
                    setRejectMessage(API_STATUS_CODE.BAD_REQUEST, "User not found")
                )
            }
        }
    } catch (error) {
        console.log("🚀 ~ updateUserInfo ~ error:", error)
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.INTERNAL_SERVER_ERROR, "Internal Server Error")
        )
    }
};


module.exports = {
    updateExhibitorData
}