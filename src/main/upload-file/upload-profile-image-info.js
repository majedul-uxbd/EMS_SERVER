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

const path = require('path');
const { pool } = require("../../../database/db");
const { setRejectMessage } = require("../../common/set-reject-message");
const { API_STATUS_CODE } = require("../../consts/error-status");


const insertImageDataQuery = async (bodyData, authData) => {
    let tableName = '';

    if (authData.role === 'visitor') {
        tableName = 'visitors';
    } else {
        tableName = 'user';
    }
    const _query = `
    UPDATE 
        ${tableName}
    SET
        profile_img = ?,
        updated_at = ?
    WHERE
        id = ?;
    `;
    const _values = [
        bodyData.filePath,
        bodyData.updatedAt,
        authData.id
    ]

    try {
        const [result] = await pool.query(_query, _values);
        if (result.affectedRows > 0) {
            return true;
        } return false;
    } catch (error) {
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Operation failed')
        );
    }
}

/**
 * @description This function is used to insert uploaded image path into database 
 */
const insertImageData = async (fileName, authData) => {
    const filePath = path.join('uploads/profile-images/', fileName);
    const updatedAt = new Date();
    const bodyData = { filePath, updatedAt: updatedAt }

    try {
        const isInsert = await insertImageDataQuery(bodyData, authData);
        if (isInsert) {
            return Promise.resolve({
                status: 'success',
                message: 'Image uploaded successfully'
            })
        }
    } catch (error) {
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.INTERNAL_SERVER_ERROR, 'Internal Server Error')
        );
    }
}

module.exports = {
    insertImageData
}