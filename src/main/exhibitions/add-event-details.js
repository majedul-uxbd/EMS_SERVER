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


const checkEventAlreadyExists = async (bodyData) => {
    const _query = `
        SELECT
            id
        FROM
            event_details
        WHERE
            exhibition_day_id = ?;
    `;

    try {
        const [result] = await pool.query(_query, bodyData.exhibitionDayId);
        if (result.length > 0) {
            return true;
        }
        return false;
    } catch (error) {
        return Promise.reject(error);
    }
}


const insertEventDetailsData = async (bodyData) => {
    const _query = `
        INSERT INTO
            event_details
            (
                exhibitions_id,
                exhibition_day_id,
                exhibition_date,
                exhibition_day,
                title,
                descriptions,
                created_at
            )
        VALUES (?, ?, ?, ?, ?, ?, ?);
    `;

    const _values = [
        bodyData.exhibitionId,
        bodyData.exhibitionDayId,
        bodyData.exhibitionDate,
        bodyData.exhibitionDay,
        bodyData.title,
        bodyData.descriptions,
        bodyData.createsAt
    ]

    try {
        const [result] = await pool.query(_query, _values);
        if (result.affectedRows > 0) {
            return true;
        }
        return false;
    } catch (error) {
        console.log('🚀 ~ file: add-event-details.js:72 ~ insertEventDetailsData ~ error:', error);
        return Promise.reject(error);
    }
}

/**
 * This function is used to insert event details into the database
 */
const addEventDetails = async (bodyData) => {
    const date = new Date();
    bodyData = { ...bodyData, createsAt: date }
    try {
        const isAlreadyExist = await checkEventAlreadyExists(bodyData);
        if (isAlreadyExist) {
            return Promise.reject(
                setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Event details already exists')
            );
        }
        const insertData = await insertEventDetailsData(bodyData);
        if (insertData) {
            return Promise.resolve({
                status: 'success',
                message: 'Event details added successfully'
            });
        }
    } catch (error) {
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.INTERNAL_SERVER_ERROR, 'Internal Server Error')
        );
    }
}

module.exports = {
    addEventDetails
}