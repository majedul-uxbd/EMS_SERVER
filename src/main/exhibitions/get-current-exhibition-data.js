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

const getCurrentExhibitionData = async (bodyData) => {
    const lgKey = bodyData.lg;
    const today = new Date();
    try {
        const exhibitionInfo = await getExhibitionQuery();

        const currentExhibitions = exhibitionInfo.filter(exhibition => {
            const dates = JSON.parse(exhibition.exhibition_dates);
            // Normalize today to ignore time
            const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

            // Check if any date in the exhibition's dates array matches the normalizedToday
            const hasMatchingDate = dates.some(date => new Date(date).toDateString() === normalizedToday.toDateString());

            return hasMatchingDate;
        });

        console.warn('🚀 ~ getCurrentExhibitionData ~ currentExhibitions:', currentExhibitions);

        if (currentExhibitions.length > 0) {
            return Promise.resolve(
                setServerResponse(
                    API_STATUS_CODE.OK,
                    'get_upcoming_exhibitions_successfully',
                    lgKey,
                    currentExhibitions
                ))
        } else {
            return Promise.resolve(
                setServerResponse(
                    API_STATUS_CODE.OK,
                    'no_current_exhibitions',
                    lgKey,
                    currentExhibitions
                )
            )
        }
    } catch (error) {
        // console.log('🚀 ~ file: get-upcoming-exhibitions.js:80 ~ getCurrentExhibitionData ~ error:', error);
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
    getCurrentExhibitionData
}