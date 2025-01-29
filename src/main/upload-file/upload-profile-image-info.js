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
const fs = require('fs');
const { pool } = require("../../../database/db");
const { setServerResponse } = require("../../common/set-server-response");
const { API_STATUS_CODE } = require("../../consts/error-status");
const sharp = require('sharp');



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
        updated_by_ip = ?,
        updated_at = ?
    WHERE
        id = ?;
    `;
    const _values = [
        bodyData.filePath,
        bodyData.ipAddress,
        bodyData.updatedAt,
        authData.id
    ]

    try {
        const [result] = await pool.query(_query, _values);
        if (result.affectedRows > 0) {
            return true;
        } return false;
    } catch (error) {
        return Promise.reject(error);
    }
}

/**
 * @description This function is used to insert uploaded image path into database 
 */
const insertImageData = async (buffer, authData, bodyData) => {
    const lgKey = bodyData.lg;

    const filePath = path.normalize(`uploads/profile-images/image-${Date.now()}.jpeg`);
    const updatedAt = new Date();
    bodyData = { ...bodyData, filePath, updatedAt: updatedAt }

    try {
        const resizeImage = await sharp(buffer)
            .resize(700, 700)
            .jpeg({ mozjpeg: true })
            .toBuffer();

        fs.writeFileSync(filePath, resizeImage);

        const isInsert = await insertImageDataQuery(bodyData, authData);
        if (isInsert) {
            return Promise.resolve(
                setServerResponse(
                    API_STATUS_CODE.OK,
                    'image_uploaded_successfully',
                    lgKey,
                    filePath
                )
            )
        } else {
            return Promise.reject(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'failed_to_upload_image',
                    lgKey,
                )
            );
        }
    } catch (error) {
        // console.log('🚀 ~ file: upload-profile-image-info.js:88 ~ insertImageData ~ error:', error);
        return Promise.reject(
            setServerResponse(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                'internal_server_error',
                lgKey,
            )
        );
    }
}

module.exports = {
    insertImageData
}