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
        return Promise.reject(
            setRejectMessage(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                'operation_failed'
            )
        );
    }
}

const getUpcomingExhibitions = async () => {
    const today = new Date();
    try {
        const exhibitionInfo = await getExhibitionQuery();

        const upcomingExhibitions = exhibitionInfo.filter(exhibition => {
            const dates = JSON.parse(exhibition.exhibition_dates);
            // Check if 1st date is after today
            const hasUpcomingDate = new Date(dates[0]) > today;

            return hasUpcomingDate;
        });

        if (upcomingExhibitions.length > 0) {
            return Promise.resolve({
                data: upcomingExhibitions
            })
        } else {
            return Promise.reject(
                setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'No upcoming exhibitions')
            )
        }

    } catch (error) {
        // console.log('🚀 ~ file: get-upcoming-exhibitions.js:68 ~ getUpcomingExhibitions ~ error:', error);
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.INTERNAL_SERVER_ERROR, 'Internal Server Error')
        )

    }
}

module.exports = {
    getUpcomingExhibitions
}