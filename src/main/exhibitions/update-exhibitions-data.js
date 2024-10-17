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


const updateUserInfoQuery = (bodyData) => {

    let _query = `UPDATE exhibitions SET `;
    const _values = [];

    if (bodyData.exhibitionTitle) {
        _query += 'exhibitions_title = ? ';
        _values.push(bodyData.exhibitionTitle);
    }

    if (bodyData.exhibitionStartDate) {
        if (_values.length > 0) {
            _query += ', ';
        }
        _query += 'exhibition_start_date = ? ';
        _values.push(bodyData.exhibitionStartDate);
    }
    if (bodyData.exhibitionEndDate) {
        if (_values.length > 0) {
            _query += ', ';
        }
        _query += 'exhibition_end_date = ? ';
        _values.push(bodyData.exhibitionEndDate);
    }
    if (bodyData.exhibitionVenue) {
        if (_values.length > 0) {
            _query += ', ';
        }
        _query += 'exhibition_venue = ? ';
        _values.push(bodyData.exhibitionVenue);
    }

    if (_values.length > 0) {
        _query += ', updated_at = ? ';
        _values.push(bodyData.updated_at);
    }

    _query += 'WHERE id  =?';
    _values.push(bodyData.id);

    return [_query, _values];
};

const updateExhibitionData = async (bodyData, userData) => {
    const epochTimestamp = Math.floor(new Date().getTime() / 1000);

    bodyData = { ...bodyData, updated_at: epochTimestamp }
    try {
        const [_query, values] = await updateUserInfoQuery(bodyData);
        const [isUpdateUser] = await pool.query(_query, values);
        if (isUpdateUser.affectedRows > 0) {
            return Promise.resolve({
                status: 'success',
                message: 'Exhibition data updated successfully'
            });
        } else {
            return Promise.reject(
                setRejectMessage(API_STATUS_CODE.BAD_REQUEST, "Failed to update exhibitions information")
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
    updateExhibitionData
}