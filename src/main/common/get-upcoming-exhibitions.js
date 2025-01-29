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
const { setRejectMessage, setServerResponse } = require("../../common/set-server-response");
const { API_STATUS_CODE } = require("../../consts/error-status");


const getExhibitionQuery = async () => {
    const _query = `
        SELECT
            id,
            exhibitions_title,
            exhibition_dates,
            exhibition_venue
        FROM
            exhibitions;
            `;

    try {
        const [result] = await pool.query(_query);
        return Promise.resolve(result);
    } catch (error) {
        // console.log('🚀 ~ userLoginQuery ~ error:', error);
        return Promise.reject(error);
    }
}

const getUpcomingExhibitions = async (bodyData) => {
    const lgKey = bodyData.lg;
    const today = new Date();
    try {
        const exhibitionInfo = await getExhibitionQuery();

        const upcomingExhibitions = exhibitionInfo.filter(exhibition => {
            const dates = JSON.parse(exhibition.exhibition_dates);
            // Check if 1st date is after today
            const normalizedToday = new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate()
            );
            const hasUpcomingDate = new Date(dates[0]) > normalizedToday;

            return hasUpcomingDate;
        });

        if (upcomingExhibitions.length > 0) {
            return Promise.resolve(
                setServerResponse(
                    API_STATUS_CODE.OK,
                    'get_upcoming_exhibitions_successfully',
                    lgKey,
                    upcomingExhibitions
                ))
        } else {
            return Promise.reject(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'no_upcoming_exhibitions',
                    lgKey,
                )
            )
        }
    } catch (error) {
        // console.log('🚀 ~ file: get-upcoming-exhibitions.js:80 ~ getUpcomingExhibitions ~ error:', error);
        return Promise.reject(
            setServerResponse(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                'internal_server_error',
                lgKey,
            )
        )

    }
}

module.exports = {
    getUpcomingExhibitions
}