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

const isDataAvailable = async (bodyData) => {
    const _query = `
        SELECT
            id
        FROM
            exhibitions_has_organizer
        WHERE
            exhibitions_has_organizer.organizer_id = ? AND
            exhibitions_has_organizer.exhibition_id = ?;
    `;

    const _values = [
        bodyData.organizerId,
        bodyData.exhibitionId
    ]
    try {
        const [result] = await pool.query(_query, _values);
        if (result.length > 0) {
            return Promise.resolve(true);
        }
        return Promise.resolve(false);
    } catch (error) {
        // console.log('🚀 ~ file: get-event-date.js:30 ~ getEventDateQuery ~ error:', error);
        return Promise.reject(error);
    }
}

const deleteAssignOrganizerData = async (bodyData) => {
    const _query = `
        DELETE
        FROM
            exhibitions_has_organizer
        WHERE
            exhibitions_has_organizer.organizer_id = ? AND
            exhibitions_has_organizer.exhibition_id = ?;
    `;

    const _values = [
        bodyData.organizerId,
        bodyData.exhibitionId
    ]
    try {
        const [result] = await pool.query(_query, _values);
        if (result.affectedRows === 1) {
            return Promise.resolve(true);
        }
        return Promise.resolve(false);
    } catch (error) {
        // console.log('🚀 ~ file: get-event-date.js:30 ~ getEventDateQuery ~ error:', error);
        return Promise.reject(error);
    }
}


const unassignOrganizer = async (bodyData) => {
    const lgKey = bodyData.lg;

    try {
        const isExist = await isDataAvailable(bodyData);
        if (!isExist) {
            return Promise.resolve(
                setServerResponse(
                    API_STATUS_CODE.OK,
                    'data_not_found',
                    lgKey
                )
            )
        }
        const isDelete = await deleteAssignOrganizerData(bodyData);
        if (isDelete) {
            return Promise.resolve(
                setServerResponse(
                    API_STATUS_CODE.OK,
                    'volunteer_unassign_successfully',
                    lgKey
                ))
        }
    } catch (error) {
        // console.log('🚀 ~ file: get-enrolled-exhibition-data.js:97 ~ getEnrolledExhibitionData ~ error:', error);
        return Promise.reject(
            setServerResponse(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                'internal_server_error',
                lgKey
            )
        )
    }
};

module.exports = {
    unassignOrganizer
}