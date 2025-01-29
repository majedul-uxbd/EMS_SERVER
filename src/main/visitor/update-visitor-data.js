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

const updateUserInfoQuery = (bodyData, authData) => {

    let _query = `UPDATE visitors SET `;
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

    if (_values.length > 0) {
        _query += ', updated_at = ? ';
        _values.push(bodyData.updated_at);
    }

    _query += 'WHERE id  =?';
    _values.push(authData.id);

    return [_query, _values];
};

const updateVisitorData = async (bodyData, authData) => {
    const lgKey = bodyData.lg;
    const updatedAt = new Date();

    bodyData = { ...bodyData, updated_at: updatedAt }
    try {
        const [_query, values] = await updateUserInfoQuery(bodyData, authData);
        const [isUpdateUser] = await pool.query(_query, values);
        if (isUpdateUser.affectedRows > 0) {
            return Promise.resolve(
                setServerResponse(
                    API_STATUS_CODE.OK,
                    'user_info_updated_successfully',
                    lgKey,
                )
            );
        } else {
            return Promise.reject(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'failed_to_update_user_information',
                    lgKey,
                )
            )
        }
    } catch (error) {
        // console.log("🚀 ~ updateUserInfo ~ error:", error)
        return Promise.reject(
            setServerResponse(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                'internal_server_error',
                lgKey,
            )
        )
    }
};


module.exports = {
    updateVisitorData
}