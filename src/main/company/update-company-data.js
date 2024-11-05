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


const updateCompanyInfoQuery = (bodyData) => {
    let _query = `UPDATE companies SET `;
    const _values = [];

    if (bodyData.companyName) {
        _query += 'name = ? ';
        _values.push(bodyData.companyName);
    }

    if (bodyData.website_link) {
        if (_values.length > 0) {
            _query += ', ';
        }
        _query += 'website_link = ? ';
        _values.push(bodyData.website_link);
    }

    if (bodyData.address) {
        if (_values.length > 0) {
            _query += ', ';
        }
        _query += 'address = ? ';
        _values.push(bodyData.address);
    }

    if (bodyData.email) {
        if (_values.length > 0) {
            _query += ', ';
        }
        _query += 'email = ? ';
        _values.push(bodyData.email);
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
 * @description This function will update company account information
 */
const updateCompanyInfo = async (bodyData) => {
    const createdAt = new Date();

    bodyData = { ...bodyData, updated_at: createdAt }
    try {
        const [_query, values] = await updateCompanyInfoQuery(bodyData);

        const [isUpdateUser] = await pool.query(_query, values);
        if (isUpdateUser.affectedRows > 0) {
            return Promise.resolve({
                status: 'success',
                message: 'Company info updated successfully'
            });
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
    updateCompanyInfo
}