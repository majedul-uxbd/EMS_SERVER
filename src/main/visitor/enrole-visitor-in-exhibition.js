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


// const checkUserCompanyIsValid = async (bodyData) => {

//     const _query = `
//         SELECT
//             id
//         FROM
//             companies
//         WHERE
//             id = ? AND
//             is_active = ${1}
//     `;

//     try {
//         const [result] = await pool.query(_query, bodyData.companyId);
//         if (result.length > 0) {
//             return true;
//         }
//         return false;
//     } catch (error) {
//         return Promise.reject(error);
//     }
// };


const checkIfVisitorAlreadyEnrolled = async (authData) => {

    const _query = `
        SELECT
            id
        FROM
            exhibitions_has_visitor
        WHERE
            visitor_id  = ?;
    `;

    const _values = [
        authData.id
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
 * @description
 */
const enrollVisitorInExhibition = async (authData, bodyData) => {
    try {
        const isAlreadyEnrolled = await checkIfVisitorAlreadyEnrolled(authData);
        if (isAlreadyEnrolled) {
            return Promise.reject(
                setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'You have already enrolled')
            );
        }
        const insertData = await insertEnrollData(authData, bodyData);
        if (insertData) {
            return Promise.resolve({
                status: 'success',
                message: 'You are enrolled successfully'
            });
        }

    } catch (error) {
        console.log('🚀 ~ file: enroll-company-in-exhibitions.js:127 ~ error:', error);
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.INTERNAL_SERVER_ERROR, 'Internal server error')
        );
    }
}

module.exports = {
    enrollVisitorInExhibition
}