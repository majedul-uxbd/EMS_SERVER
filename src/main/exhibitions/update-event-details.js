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

const _ = require('lodash');
const { pool } = require("../../../database/db");
const { isValidEventTitle, isValidEventDescription } = require("../../common/user-data-validator");
const { API_STATUS_CODE } = require("../../consts/error-status");
const { setServerResponse } = require('../../common/set-server-response');


const checkIfEventIdIsExists = async (bodyData) => {
    const _query = `
        SELECT
            id
        FROM
            event_details
        WHERE
            id = ?;
    `;

    try {
        const [result] = await pool.query(_query, bodyData.id);
        if (result.length > 0) {
            return true;
        }
        return false;
    } catch (error) {
        return Promise.reject(error);
    }
}


const updateEventDetailsData = async (bodyData) => {
    const _query = `
        UPDATE
            event_details
        SET
            title = ?,
            descriptions = ?,
            updated_at = ?
        WHERE
            id = ?;
    `;

    const _values = [
        bodyData.title,
        bodyData.description,
        bodyData.updatedAt,
        bodyData.id
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
const updateEventDetails = async (bodyData) => {
    const lgKey = bodyData.lg;

    const date = new Date();
    bodyData = { ...bodyData, updatedAt: date }

    if (_.isNil(bodyData.id) || !_.isNumber(bodyData.id)) {
        return Promise.reject(
            setServerResponse(
                API_STATUS_CODE.BAD_REQUEST,
                'event_id_is_required',
                lgKey
            )
        );
    }

    if (!isValidEventTitle(bodyData.title)) {
        return Promise.reject(
            setServerResponse(
                API_STATUS_CODE.BAD_REQUEST,
                'invalid_event_title',
                lgKey
            )
        )
    }
    if (!isValidEventDescription(bodyData.description)) {
        return Promise.reject(
            setServerResponse(
                API_STATUS_CODE.BAD_REQUEST,
                'invalid_event_description',
                lgKey
            )
        )
    }
    try {
        const isExist = await checkIfEventIdIsExists(bodyData);
        if (!isExist) {
            return Promise.reject(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'event_details_is_not_found',
                    lgKey
                )
            );
        }
        const updateData = await updateEventDetailsData(bodyData);
        if (updateData) {
            return Promise.resolve(
                setServerResponse(
                    API_STATUS_CODE.OK,
                    'event_details_updated_successfully',
                    lgKey
                )
            );
        }
    } catch (error) {
        // console.log('🚀 ~ file: update-event-details.js:104 ~ updateEventDetails ~ error:', error);
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
    updateEventDetails
}