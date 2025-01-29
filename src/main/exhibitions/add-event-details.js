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


const checkIsExhibitionExists = async (bodyData) => {
    const _query = `
        SELECT
            id
        FROM
            exhibitions
        WHERE
            id = ?;
    `;

    try {
        const [result] = await pool.query(_query, bodyData.exhibitionId);
        if (result.length > 0) {
            return true;
        }
        return false;
    } catch (error) {
        return Promise.reject(error);
    }
}

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
        // console.log('🚀 ~ file: add-event-details.js:72 ~ insertEventDetailsData ~ error:', error);
        return Promise.reject(error);
    }
}

/**
 * This function is used to insert event details into the database
 */
const addEventDetails = async (bodyData) => {
    const lgKey = bodyData.lg;

    const date = new Date();
    bodyData = { ...bodyData, createsAt: date }
    try {
        const isExhibitionExist = await checkIsExhibitionExists(bodyData);
        if (!isExhibitionExist) {
            return Promise.reject(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'exhibition_is_not_found',
                    lgKey,
                )
            );
        }
        const isAlreadyExist = await checkEventAlreadyExists(bodyData);
        if (isAlreadyExist) {
            return Promise.reject(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'event_details_already_exists',
                    lgKey,
                )
            );
        }
        const insertData = await insertEventDetailsData(bodyData);
        if (insertData) {
            return Promise.resolve(
                setServerResponse(
                    API_STATUS_CODE.OK,
                    'event_details_added_successfully',
                    lgKey,
                ));
        }
    } catch (error) {
        // console.log('🚀 ~ file: add-event-details.js:106 ~ addEventDetails ~ error:', error);
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
    addEventDetails
}