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


const getEventDetailsQuery = async (bodyData) => {
    const _query = `
        SELECT
            id,
            exhibition_day_id,
            exhibition_day,
            title,
            descriptions
        FROM
            event_details
        WHERE
            exhibitions_id = ?;
            `;

    const _values = [
        bodyData.exhibitionID
    ];


    try {
        const [result] = await pool.query(_query, _values);
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


const getExhibitionDataQuery = async (bodyData) => {
    const _query = `
        SELECT
            exhibitions_title,
            exhibition_dates,
            exhibition_venue
        FROM
            exhibitions
        WHERE
            exhibitions.id = ?
        ;
    `;

    const _values = [
        bodyData.exhibitionID
    ];


    try {
        const [result] = await pool.query(_query, _values);
        return Promise.resolve(result[0]);
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


/**
 * @description This function is used to get all exhibitions data eor visitor and exhibitor
 */
const getExhibitionData = async (bodyData) => {

    try {
        let exhibitionInfo = await getExhibitionDataQuery(bodyData);
        const eventDetails = await getEventDetailsQuery(bodyData);
        exhibitionInfo = { ...exhibitionInfo, eventDetails };
        return Promise.resolve({
            data: exhibitionInfo
        });
    } catch (error) {
        // console.log("🚀 ~ userLogin ~ error:", error)
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.INTERNAL_SERVER_ERROR, 'Internal Server Error')
        );
    }
};


module.exports = {
    getExhibitionData
}