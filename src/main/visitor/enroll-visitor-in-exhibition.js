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


const checkIfVisitorAlreadyEnrolled = async (authData, bodyData) => {

    const _query = `
        SELECT
            id
        FROM
            exhibitions_has_visitor
        WHERE
            visitor_id  = ? AND
            exhibition_id = ?;
    `;

    const _values = [
        authData.id,
        bodyData.exhibitionId
    ]

    try {
        const [result] = await pool.query(_query, _values);
        if (result.length > 0) {
            return true;
        }
        return false;
    } catch (error) {
        return Promise.reject(error);
    }
};


const insertEnrollData = async (authData, bodyData) => {
    const _query = `
        INSERT INTO
            exhibitions_has_visitor
            (
                exhibition_id,
                visitor_id,
                created_at
            )
        VALUES ( ?, ?, UTC_TIMESTAMP());
    `;

    const _values = [
        bodyData.exhibitionId,
        authData.id
    ]

    try {
        const [result] = await pool.query(_query, _values);
        if (result.affectedRows > 0) {
            return true;
        }
        return false;
    } catch (error) {
        return Promise.reject(error);
    }
};


/**
 * @description This function is used to insert visitor enroll data into the database
 */
const enrollVisitorInExhibition = async (authData, bodyData) => {
    const lgKey = bodyData.lg;
    try {
        const isAlreadyEnrolled = await checkIfVisitorAlreadyEnrolled(authData, bodyData);
        if (isAlreadyEnrolled) {
            return Promise.reject(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'you_have_already_enrolled',
                    lgKey
                )
            );
        }
        const insertData = await insertEnrollData(authData, bodyData);
        if (insertData) {
            return Promise.resolve(
                setServerResponse(
                    API_STATUS_CODE.OK,
                    'you_are_enrolled_successfully',
                    lgKey
                )
            );
        }

    } catch (error) {
        // console.log('🚀 ~ file: enroll-company-in-exhibitions.js:127 ~ error:', error);
        return Promise.reject(
            setServerResponse(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                'internal_server_error',
                lgKey
            )
        );
    }
}

module.exports = {
    enrollVisitorInExhibition
}