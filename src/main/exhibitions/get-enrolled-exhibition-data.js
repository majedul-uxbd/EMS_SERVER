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


const getEnrolledExhibitionDataQuery = async (bodyData) => {
    const _query = `
        SELECT 
            ex.id,
            ex.exhibitions_title,
            ex.exhibition_dates,
            ex.exhibition_venue,
            ex.created_at,
            ex.updated_at
        FROM 
            exhibitions_has_organizer AS eho
        LEFT JOIN
            exhibitions AS ex
        ON
            eho.exhibition_id = ex.id
        WHERE
            eho.organizer_id = ?;
    `;

    try {
        const [result] = await pool.query(_query, bodyData.organizerId);
        return Promise.resolve(result);
    } catch (error) {
        // console.log('🚀 ~ file: get-event-date.js:30 ~ getEventDateQuery ~ error:', error);
        return Promise.reject(error);
    }
}


const getEnrolledExhibitionData = async (bodyData) => {
    const lgKey = bodyData.lg;
    const today = new Date();

    try {
        const exhibitionInfo = await getEnrolledExhibitionDataQuery(bodyData);

        const exhibitionData = exhibitionInfo.filter(exhibition => {
            const dates = JSON.parse(exhibition.exhibition_dates);
            const normalizedToday = new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate()
            );
            let hasExhibitionDate = dates.some(date => new Date(date) >= normalizedToday);
            return hasExhibitionDate;
        });
        if (exhibitionData.length > 0) {
            return Promise.resolve(
                setServerResponse(
                    API_STATUS_CODE.OK,
                    'get_data_successfully',
                    lgKey,
                    exhibitionData
                ))
        } else {
            return Promise.reject(
                setServerResponse(
                    API_STATUS_CODE.OK,
                    'get_data_successfully',
                    lgKey
                )
            )
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
    getEnrolledExhibitionData
}