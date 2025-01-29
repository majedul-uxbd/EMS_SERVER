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

const { setServerResponse } = require("../../common/set-server-response");
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
        return Promise.reject(error);
    }
}

const checkExhibitorIsExistOrNotQuery = async (companyId, exhibitorData) => {

    const _query = `
    SELECT
        id
    FROM
        user
    WHERE
        id = ? AND 
        companies_id = ? AND
        role = ?;
    `;

    const _values = [
        exhibitorData.id,
        companyId,
        'exhibitor'
    ]
    try {
        const [result] = await pool.query(_query, _values);
        if (result.length > 0) {
            return true;
        }
        return false;
    } catch (error) {
        // console.log("🚀 ~ getUserData ~ error:", error)
        return Promise.reject(error);
    }
}


const updateUserInfoQuery = (exhibitorData) => {

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
    // if (exhibitorData.email) {
    //     if (_values.length > 0) {
    //         _query += ', ';
    //     }
    //     _query += 'email = ? ';
    //     _values.push(exhibitorData.email);
    // }

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
    _values.push(exhibitorData.id);

    return [_query, _values];
};

/**
 * @description This function is used to update exhibitor
 */
const updateAllExhibitorData = async (exhibitorData, authData) => {
    const updatedAt = new Date();
    const lgKey = exhibitorData.lg;

    exhibitorData = { ...exhibitorData, updated_at: updatedAt }
    try {
        const companyId = await getExhibitorCompanyQuery(authData);
        if (!_.isNil(companyId)) {
            const isExhibitorExist = await checkExhibitorIsExistOrNotQuery(companyId, exhibitorData);
            if (isExhibitorExist) {
                const [_query, values] = await updateUserInfoQuery(exhibitorData);
                const [isUpdateUser] = await pool.query(_query, values);
                if (isUpdateUser.affectedRows > 0) {
                    return Promise.resolve(
                        setServerResponse(
                            API_STATUS_CODE.OK,
                            'user_info_updated_successfully',
                            lgKey
                        )
                    );
                } else {
                    return Promise.reject(
                        setServerResponse(
                            API_STATUS_CODE.BAD_REQUEST,
                            'failed_to_update_user',
                            lgKey
                        )
                    )
                }
            } else {
                return Promise.reject(
                    setServerResponse(
                        API_STATUS_CODE.BAD_REQUEST,
                        'user_not_found',
                        lgKey
                    )
                )
            }
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
    updateAllExhibitorData
}