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


const getEventDateQuery = async (bodyData) => {
    console.log('🚀 ~ file: get-event-date.js:16 ~ getEventDateQuery ~ bodyData:', bodyData);
    const _query = `
        SELECT
            id,
            exhibition_date,
            day_title
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


const getEventDate = async (bodyData) => {
    try {
        const getDate = await getEventDateQuery(bodyData);
        return Promise.resolve({
            eventDates: getDate
        })
    } catch (error) {
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.INTERNAL_SERVER_ERROR, 'Internal Server Error')
        )
    }
};

module.exports = {
    getEventDate
}