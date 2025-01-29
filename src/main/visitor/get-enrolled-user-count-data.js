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

const _ = require('lodash');
const { API_STATUS_CODE } = require('../../consts/error-status');
const { pool } = require('../../../database/db');
const { setServerResponse } = require('../../common/set-server-response');


const getVisitorCountQuery = async (exhibitionId) => {
    const _query = `
    SELECT
        COUNT(*) AS visitor_count
    FROM
        exhibitions_has_visitor AS ehv
    WHERE
        ehv.exhibition_id = ?;
    `;

    try {
        const [result] = await pool.query(_query, exhibitionId);
        return Promise.resolve(result[0].visitor_count);
    } catch (error) {
        // console.log('🚀 ~ file: get-enrolled-visitor-data.js:44 ~ getEnrolledVisitorDataQuery ~ error:', error);
        return Promise.reject(error);
    }
}

const getExhibitorCountQuery = async (exhibitionId) => {
    const _query = `
    SELECT
        COUNT(*) AS exhibitor_count
    FROM
        user AS u
    LEFT JOIN exhibitions_has_companies AS ehc
    ON
        u.companies_id = ehc.company_id
    WHERE
        u.role IN('exhibitor', 'exhibitor_admin') AND 
        ehc.exhibition_id = ?;
    `

    try {
        const [result] = await pool.query(_query, exhibitionId);
        return Promise.resolve(result[0].exhibitor_count);
    } catch (error) {
        // console.log('🚀 ~ file: get-enrolled-visitor-data.js:44 ~ getEnrolledVisitorDataQuery ~ error:', error);
        return Promise.reject(error);
    }
}

const getOrganizerCountQuery = async (exhibitionId) => {
    const _query = `
    SELECT
        COUNT(*) AS organizer_count
    FROM
        exhibitions_has_organizer AS eho
    WHERE
        eho.exhibition_id = ?;
    `

    try {
        const [result] = await pool.query(_query, exhibitionId);
        return Promise.resolve(result[0].organizer_count);
    } catch (error) {
        // console.log('🚀 ~ file: get-enrolled-visitor-data.js:44 ~ getEnrolledVisitorDataQuery ~ error:', error);
        return Promise.reject(error);
    }
}

const getCompanyCountQuery = async (exhibitionId) => {
    const _query = `
    SELECT
        COUNT(*) AS company_count
    FROM
        exhibitions_has_companies AS ehc
    WHERE
        ehc.exhibition_id = ?;
    `

    try {
        const [result] = await pool.query(_query, exhibitionId);
        return Promise.resolve(result[0].company_count);
    } catch (error) {
        // console.log('🚀 ~ file: get-enrolled-visitor-data.js:44 ~ getEnrolledVisitorDataQuery ~ error:', error);
        return Promise.reject(error);
    }
}

const getProjectCountQuery = async (exhibitionId) => {
    const _query = `
    SELECT
        COUNT(*) AS project_count
    FROM
        projects AS p
    LEFT JOIN exhibitions_has_companies AS ehc
    ON
        p.companies_id = ehc.company_id
    WHERE
        ehc.exhibition_id = ?;
    `

    try {
        const [result] = await pool.query(_query, exhibitionId);
        return Promise.resolve(result[0].project_count);
    } catch (error) {
        // console.log('🚀 ~ file: get-enrolled-visitor-data.js:44 ~ getEnrolledVisitorDataQuery ~ error:', error);
        return Promise.reject(error);
    }
}

const getExhibitionDays = async (exhibitionId) => {
    const _query = `
    SELECT
        id
    FROM
        exhibition_days
    WHERE
        exhibitions_id  = ?;
    `;

    try {
        const [result] = await pool.query(_query, exhibitionId);
        return Promise.resolve(result);
    } catch (error) {
        // console.log('🚀 ~ file: get-enrolled-visitor-data.js:44 ~ getEnrolledVisitorDataQuery ~ error:', error);
        return Promise.reject(error);
    }
}


const getAttendanceCountQueryForExhibitor = async (dayId) => {
    const _query = `
    SELECT 
        COUNT(DISTINCT exhibitor_id) AS attended_exhibitors
    FROM 
        attendances AS a
    LEFT JOIN
        exhibition_days AS ed
    ON a.exhibition_days_id = ed.id
    LEFT JOIN
        exhibitions AS e
    ON ed.exhibitions_id = e.id
    WHERE
        e.id = ?;
    `;

    try {
        const [result] = await pool.query(_query, dayId);
        return Promise.resolve(result[0].attended_exhibitors)
    } catch (error) {
        // console.log('🚀 ~ file: get-enrolled-visitor-data.js:44 ~ getEnrolledVisitorDataQuery ~ error:', error);
        return Promise.reject(error);
    }
}

const getAttendanceCountQueryForVisitor = async (dayId) => {
    const _query = `
    SELECT 
        COUNT(DISTINCT visitors_id) AS attended_visitors
    FROM 
        attendances AS a
    LEFT JOIN
        exhibition_days AS ed
    ON a.exhibition_days_id = ed.id
    LEFT JOIN
        exhibitions AS e
    ON ed.exhibitions_id = e.id
    WHERE
        e.id = ?;
    `;

    try {
        const [result] = await pool.query(_query, dayId);
        return Promise.resolve(result[0].attended_visitors)
    } catch (error) {
        // console.log('🚀 ~ file: get-enrolled-visitor-data.js:44 ~ getEnrolledVisitorDataQuery ~ error:', error);
        return Promise.reject(error);
    }
}


// const getVisitorAttendanceQuery = async (dayId, visitorId) => {
//     const _query = `
//     SELECT
//         id
//     FROM
//         attendances
//     WHERE
//         exhibition_days_id  = ? AND
//         visitors_id = ?;
//     `;

//     try {
//         const [result] = await pool.query(_query, [dayId, visitorId]);
//         if (result.length > 0) {
//             return "P"
//         }
//         return "A";
//     } catch (error) {
//         // console.log('🚀 ~ file: get-enrolled-visitor-data.js:44 ~ getEnrolledVisitorDataQuery ~ error:', error);
//         return Promise.reject(error);
//     }
// }


/**
 * @description This function is used to get user data, there attendance data based on exhibition 
 */
const getEnrolledUserCountData = async (bodyData) => {
    const lgKey = bodyData.lg;
    let totalAttendedVisitorCount = 0;
    let totalAttendedExhibitorCount = 0;
    let allCounts;

    const exhibitionId = bodyData.exhibitionId
    if (_.isNil(exhibitionId)) {
        return Promise.reject(
            setServerResponse(
                API_STATUS_CODE.BAD_REQUEST,
                'exhibition_id_is_not_found',
                lgKey
            )
        )
    }
    try {
        const visitorCount = await getVisitorCountQuery(bodyData.exhibitionId);
        const exhibitorCount = await getExhibitorCountQuery(bodyData.exhibitionId);
        const organizerCount = await getOrganizerCountQuery(bodyData.exhibitionId);
        const companyCount = await getCompanyCountQuery(bodyData.exhibitionId);
        const projectCount = await getProjectCountQuery(bodyData.exhibitionId);
        // const exhibitionDays = await getExhibitionDays(bodyData.exhibitionId);
        totalAttendedVisitorCount = await getAttendanceCountQueryForVisitor(bodyData.exhibitionId);
        totalAttendedExhibitorCount = await getAttendanceCountQueryForExhibitor(bodyData.exhibitionId);
        // for (const day of exhibitionDays) {
        //     const attendanceCount = await getAttendanceCountQuery(day.id);
        //     totalAttendedVisitorCount += attendanceCount[0].attended_visitor_count || 0;
        //     totalAttendedExhibitorCount += attendanceCount[0].attended_exhibitor_count || 0;
        // }

        allCounts = {
            visitorCount,
            exhibitorCount,
            organizerCount,
            companyCount,
            projectCount,
            totalAttendedVisitorCount,
            totalAttendedExhibitorCount
        }

        return Promise.resolve(
            setServerResponse(
                API_STATUS_CODE.OK,
                'get_data_successfully',
                lgKey,
                allCounts
            )
        )

    } catch (error) {
        return Promise.reject(
            setServerResponse(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                'internal_server_error',
                lgKey
            )
        )
    }
}

module.exports = {
    getEnrolledUserCountData
}