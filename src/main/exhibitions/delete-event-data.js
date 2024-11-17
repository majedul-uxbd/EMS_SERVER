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
    try {
        const isDeleteData = await deleteEventDataQuery(bodyData);
        if (isDeleteData) {
            return Promise.resolve({
                status: 'success',
                message: 'Event details deleted successfully'
            })
        } else {
            return Promise.reject(
                setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Event is not found')
            )
        }
    } catch (error) {
        console.log('🚀 ~ file: delete-event-data.js:54 ~ deleteEventData ~ error:', error);
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.INTERNAL_SERVER_ERROR, 'Internal server error')
        );
    }
};

module.exports = {
    deleteEventData
}