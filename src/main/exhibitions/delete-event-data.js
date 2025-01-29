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


const deleteEventDataQuery = async (bodyData) => {
    const _query = `
        DELETE
            FROM
            event_details
        WHERE
            id = ?;
    `;

    try {
        const [result] = await pool.query(_query, bodyData.id);
        if (result.affectedRows === 1) {
            return true;
        }
        return false;
    } catch (error) {
        return Promise.reject(error);
    }
}

/**
 * This function is used to delete event details data
 */
const deleteEventData = async (bodyData) => {
    const lgKey = bodyData.lg;

    try {
        const isDeleteData = await deleteEventDataQuery(bodyData);
        if (isDeleteData) {
            return Promise.resolve(
                setServerResponse(
                    API_STATUS_CODE.OK,
                    'event_details_deleted_successfully',
                    lgKey,
                )
            )
        } else {
            return Promise.reject(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'event_is_not_found',
                    lgKey,
                ))
        }
    } catch (error) {
        // console.log('🚀 ~ file: delete-event-data.js:54 ~ deleteEventData ~ error:', error);
        return Promise.reject(
            setServerResponse(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                'internal_server_error',
                lgKey,
            )
        );
    }
};

module.exports = {
    deleteEventData
}