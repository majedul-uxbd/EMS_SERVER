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

const getEnrolledUserDataQuery = async (bodyData) => {
    let query;
    let values;
    const _query1 = `
    SELECT
        v.id,
        v.f_name,
        v.l_name,
        v.email,
        v.contact_no,
        v.company,
        v.position,
        v.created_at,
        v.updated_at
    FROM
        visitors AS v 
    LEFT JOIN
        exhibitions_has_visitor as ehv
    ON
        v.id = ehv.visitor_id
    WHERE
        ehv.exhibition_id = ?;
    `;

    const _query2 = `
    SELECT
        u.id,
        u.f_name,
        u.l_name,
        u.email,
        u.contact_no,
        u.position,
        u.created_at,
        u.updated_at
    FROM
        user AS u
    LEFT JOIN exhibitions_has_companies AS ehc
    ON
        u.companies_id = ehc.company_id
    WHERE
        u.role IN ('exhibitor', 'exhibitor_admin') AND
        ehc.exhibition_id = ? AND
        ehc.company_id = ?;
    `;

    const _query3 = `
    SELECT
        u.id,
        u.f_name,
        u.l_name,
        u.email,
        u.contact_no,
        u.position,
        u.created_at,
        u.updated_at
    FROM
        user AS u
    LEFT JOIN exhibitions_has_organizer AS eho
    ON
        u.id = eho.organizer_id
    WHERE
        u.role = 'organizer' AND
        eho.exhibition_id = ?;
    `;

    if (bodyData.userType === "visitor") {
        query = _query1;
        values = [
            bodyData.exhibitionId
        ]
    } else if (bodyData.userType === "exhibitor" || bodyData.userType === "exhibitor_admin") {
        query = _query2;
        values = [
            bodyData.exhibitionId,
            bodyData.companyId
        ]
    } else if (bodyData.userType === "organizer") {
        query = _query3;
        values = [
            bodyData.exhibitionId
        ]
    }

    try {
        const [result] = await pool.query(query, values);
        return Promise.resolve(result);
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


const getExhibitorAttendanceQuery = async (dayId, exhibitorId) => {
    const _query = `
    SELECT
        *
    FROM
        attendances
    WHERE
        exhibition_days_id  = ? AND
        exhibitor_id = ?;
    `;

    try {
        const [result] = await pool.query(_query, [dayId, exhibitorId]);
        if (result.length > 0) {
            return "P"
        }
        return "A";
    } catch (error) {
        // console.log('🚀 ~ file: get-enrolled-visitor-data.js:44 ~ getEnrolledVisitorDataQuery ~ error:', error);
        return Promise.reject(error);
    }
}


const getVisitorAttendanceQuery = async (dayId, visitorId) => {
    const _query = `
    SELECT
        id
    FROM
        attendances
    WHERE
        exhibition_days_id  = ? AND
        visitors_id = ?;
    `;

    try {
        const [result] = await pool.query(_query, [dayId, visitorId]);
        if (result.length > 0) {
            return "P"
        }
        return "A";
    } catch (error) {
        // console.log('🚀 ~ file: get-enrolled-visitor-data.js:44 ~ getEnrolledVisitorDataQuery ~ error:', error);
        return Promise.reject(error);
    }
}


/**
 * @description This function is used to get user data, there attendance data based on exhibition 
 */
const getEnrolledUserData = async (bodyData) => {
    const lgKey = bodyData.lg;
    let userinfo;
    let userData = [];
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
        const enrolledData = await getEnrolledUserDataQuery(bodyData);
        if (enrolledData.length > 0) {
            const exhibitionDays = await getExhibitionDays(exhibitionId);

            if (bodyData.userType !== 'organizer') {
                for (const user of enrolledData) {
                    const isPresent = [];

                    for (let i = 0; i < exhibitionDays.length; i++) {
                        if (bodyData.userType === 'visitor') {
                            const isVisitorPresent = await getVisitorAttendanceQuery(exhibitionDays[i].id, user.id);
                            isPresent.push(isVisitorPresent);
                        } else if (bodyData.userType === 'exhibitor' || bodyData.userType === 'exhibitor_admin') {
                            const isExhibitorPresent = await getExhibitorAttendanceQuery(exhibitionDays[i].id, user.id);
                            isPresent.push(isExhibitorPresent);
                        }
                    }

                    const isAttend = isPresent.some(data => data === "P");

                    userData.push({
                        ...user,
                        isAttend: isAttend
                    });
                    userinfo = userData
                }

                return Promise.resolve(
                    setServerResponse(
                        API_STATUS_CODE.OK,
                        'get_data_successfully',
                        lgKey,
                        userinfo
                    )
                )
            }
            userinfo = enrolledData;
            return Promise.resolve(
                setServerResponse(
                    API_STATUS_CODE.OK,
                    'get_data_successfully',
                    lgKey,
                    userinfo
                )
            )
        } else {
            userinfo = enrolledData;
            return Promise.resolve(
                setServerResponse(
                    API_STATUS_CODE.OK,
                    'get_data_successfully',
                    lgKey,
                    userinfo
                )
            )
        }
    } catch (error) {
        // console.log('🚀 ~ file: get-enrolled-visitor-data.js:134 ~ getEnrolledVisitorData ~ error:', error);
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
    getEnrolledUserData
}