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


const getAttendedUserDataQuery = async (bodyData) => {
    const _query = `
        SELECT
            COUNT(attendances.visitors_id) AS attended_visitor_count,
            COUNT(attendances.exhibitor_id) AS attended_exhibitor_count
        FROM
            attendances
        LEFT JOIN exhibition_days
        ON
            attendances.exhibition_days_id = exhibition_days.id
        LEFT JOIN
            exhibitions
            ON exhibitions.id = exhibition_days.exhibitions_id
        WHERE
            exhibitions.id = ?;
    `;

    const _values = [
        bodyData.exhibitionID
    ];


    try {
        const [result] = await pool.query(_query, _values);
        return Promise.resolve(result[0]);
    } catch (error) {
        // console.log('🚀 ~ userLoginQuery ~ error:', error);
        return Promise.reject(error);
    }
}


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
        return Promise.reject(error);
    }
}


const getExhibitionDataQuery = async (bodyData) => {
    const _query = `
        SELECT
            exhibitions.exhibitions_title,
            exhibitions.exhibition_dates,
            exhibitions.exhibition_venue,
            COUNT(ehc.company_id) AS enrolled_company_count,
            COUNT(ehv.visitor_id) AS enrolled_visitor_count
        FROM
            exhibitions
        LEFT JOIN exhibitions_has_companies AS ehc
        ON
            exhibitions.id = ehc.exhibition_id
        LEFT JOIN
            exhibitions_has_visitor AS ehv
            ON exhibitions.id = ehv.exhibition_id
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
        return Promise.reject(error);
    }
}


/**
 * @description This function is used to get all exhibitions data 
 */
const getExhibitionData = async (bodyData) => {
    const lgKey = bodyData.lg;
    try {
        let exhibitionInfo = await getExhibitionDataQuery(bodyData);
        let eventDetails = await getEventDetailsQuery(bodyData);
        const attendedUserInfo = await getAttendedUserDataQuery(bodyData);
        exhibitionInfo = { ...exhibitionInfo, ...attendedUserInfo, eventDetails }
        return Promise.resolve(
            setServerResponse(
                API_STATUS_CODE.OK,
                'get_data_successfully',
                lgKey,
                exhibitionInfo
            )
        );
    } catch (error) {
        // console.log("🚀 ~ userLogin ~ error:", error)
        return Promise.reject(
            setServerResponse(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                'internal_server_error',
                lgKey,
            ),
        )
    }
};


module.exports = {
    getExhibitionData
}