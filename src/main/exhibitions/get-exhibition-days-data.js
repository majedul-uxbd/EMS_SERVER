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


const getEventDateQuery = async (bodyData) => {
    const _query = `
        SELECT
            id,
            exhibition_date ,
            day_title,
            created_at,
            updated_at
        FROM
            exhibition_days
        WHERE
            exhibitions_id = ?;
    `;

    try {
        const [result] = await pool.query(_query, bodyData.exhibitionId);
        return Promise.resolve(result);
    } catch (error) {
        // console.log('🚀 ~ file: get-event-date.js:30 ~ getEventDateQuery ~ error:', error);
        return Promise.reject(error);
    }
}

/**
 * @description This function is used to get the event days information based on exhibition ID
 */
const getExhibitionDaysData = async (bodyData) => {
    const lgKey = bodyData.lg;

    try {
        const getDate = await getEventDateQuery(bodyData);
        return Promise.resolve(
            setServerResponse(
                API_STATUS_CODE.OK,
                'get_data_successfully',
                lgKey,
                getDate
            )
        )
    } catch (error) {
        // console.log('🚀 ~ file: get-exhibition-days-data.js:50 ~ getExhibitionDaysData ~ error:', error);
        return Promise.reject(
            setServerResponse(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                'internal_server_error',
                lgKey,
            )
        )
    }
};

module.exports = {
    getExhibitionDaysData
}