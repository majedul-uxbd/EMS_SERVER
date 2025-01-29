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


const getExhibitionDataQuery = async (authData) => {
    let query;
    const _systemAdmin = `
    SELECT 
        id, 
        exhibitions_title,
        exhibition_dates,
        exhibition_venue,
        created_at
    FROM
        exhibitions;
    `;

    const _visitor = `
    SELECT
        ex.id,
        ex.exhibitions_title,
        ex.exhibition_dates,
        ex.exhibition_venue,
        ex.created_at,
        ex.updated_at
    FROM
        exhibitions AS ex 
    LEFT JOIN
        exhibitions_has_visitor ehv
    ON ex.id = ehv.exhibition_id
    WHERE
        ehv.visitor_id = ?;
    `;

    const _organizer = `
    SELECT
        ex.id,
        ex.exhibitions_title,
        ex.exhibition_dates,
        ex.exhibition_venue,
        ex.created_at,
        ex.updated_at
    FROM
        exhibitions AS ex 
    LEFT JOIN
        exhibitions_has_organizer eho
    ON ex.id = eho.exhibition_id
    WHERE
        eho.organizer_id = ?;
    `;

    const _exhibitor = `
    SELECT
        ex.id,
        ex.exhibitions_title,
        ex.exhibition_dates,
        ex.exhibition_venue,
        ex.created_at,
        ex.updated_at
    FROM
        exhibitions AS ex 
    LEFT JOIN
        exhibitions_has_companies AS ehc
    ON ex.id = ehc.exhibition_id
    LEFT JOIN
        user AS u
    ON ehc.company_id = u.companies_id
    WHERE
        u.id =?;
    `;

    if (authData.role === "system_admin") {
        query = _systemAdmin
    } else if (authData.role === "visitor") {
        query = _visitor
    } else if (authData.role === "organizer") {
        query = _organizer
    } else if (authData.role === "exhibitor" || authData.role === "exhibitor_admin") {
        query = _exhibitor
    }
    try {
        const [result] = await pool.query(query, authData.id);
        return Promise.resolve(result);
    } catch (error) {
        // console.log('🚀 ~ userLoginQuery ~ error:', error);
        return Promise.reject(error);
    }
}


/**
 * @description This function is used to get past exhibitions information 
 */
const getPastExhibitionsData = async (authData, bodyData) => {
    const lgKey = bodyData.lg;
    const today = new Date();
    let exhibitionData;
    try {
        const exhibitionInfo = await getExhibitionDataQuery(authData);

        exhibitionData = exhibitionInfo.filter(exhibition => {
            const dates = JSON.parse(exhibition.exhibition_dates);

            const normalizedToday = new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate()
            );

            // Check if any date matches today or if the first date is in the future
            const hasMatchingWithPastDate = dates.every(date => {
                const exhibitionDate = new Date(date);

                return exhibitionDate < normalizedToday;
            });
            return hasMatchingWithPastDate;
        });
        if (exhibitionData.length > 0) {
            return Promise.resolve(
                setServerResponse(
                    API_STATUS_CODE.OK,
                    'get_data_successfully',
                    lgKey,
                    exhibitionData
                )
            )
        } else {
            return Promise.resolve(
                setServerResponse(
                    API_STATUS_CODE.OK,
                    'get_data_successfully',
                    lgKey,
                    exhibitionData
                )
            )
        }
    } catch (error) {
        // console.log('🚀 ~ file: get-past-exhibitions-data.js:71 ~ getExhibition ~ error:', error);
        return Promise.reject(
            setServerResponse(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                'internal_server_error',
                lgKey

            )
        );
    }
};


module.exports = {
    getPastExhibitionsData
}