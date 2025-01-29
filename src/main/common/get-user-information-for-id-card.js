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


const { pool } = require('../../../database/db');
const { setServerResponse } = require('../../common/set-server-response');
const { API_STATUS_CODE } = require("../../consts/error-status");


const getEventDetails = async (bodyData) => {
    const _query = `
        select
            exhibition_date,
            exhibition_day,
            title,
            descriptions
        FROM
            event_details
        WHERE
            exhibitions_id = ?;
    `;

    try {
        const [result] = await pool.query(_query, bodyData.exhibitionId);
        if (result.length > 0) {
            return result
        }
        return null;
    } catch (error) {
        // console.log("🚀 ~ getUserInformation ~ error:", error)
        return error;
    }
}

const getUserInformation = async (authData) => {
    let _query;
    const _query1 = `
    SELECT
        id,
        f_name,
        l_name,
        role,
        company AS company_name,
        position,
        profile_img
    FROM
        visitors
    WHERE
        id = ?
    `;

    const _query2 = `
    SELECT
        users.id,
        users.f_name,
        users.l_name,
        users.role,
        company.name AS company_name,
        users.position,
        users.profile_img
    FROM
        user AS users
    LEFT JOIN
        companies AS company
    ON users.companies_id = company.id
    WHERE
        users.id = ?;
    `;

    if (authData.role === 'visitor') {
        _query = _query1;
    } else {
        _query = _query2;
    }

    try {
        const [result] = await pool.query(_query, authData.id);
        if (result.length > 0) {
            return result[0]
        }
        return null;
    } catch (error) {
        // console.log("🚀 ~ getUserInformation ~ error:", error)
        return error;
    }
};


const getExhibitionsDate = async (bodyData) => {
    const _query = `
        SELECT
            exhibitions_title,
            exhibition_dates,
            exhibition_venue
        FROM
            exhibitions 
        WHERE
            id = ?;
    `;

    try {
        const [result] = await pool.query(_query, bodyData.exhibitionId);
        if (result.length > 0) {
            return result[0]
        }
        return null;
    } catch (error) {
        // console.log("🚀 ~ getUserInformation ~ error:", error)
        return error;
    }
}


const getUserInformationForIdCard = async (req, res, next) => {
    const authData = req.auth;
    const bodyData = req.body;
    const lgKey = bodyData.lg;

    try {

        const userInfo = await getUserInformation(authData);
        const exhibitionData = await getExhibitionsDate(bodyData);
        const eventDetails = await getEventDetails(bodyData);
        if (userInfo) {
            req.body.user = userInfo;
        } else {
            return res.status(API_STATUS_CODE.BAD_REQUEST).send(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'user_not_found',
                    lgKey,
                )
            )
        }
        if (exhibitionData) {
            req.body.exhibitionData = exhibitionData;
        } else {
            return res.status(API_STATUS_CODE.BAD_REQUEST).send(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'exhibition_is_not_found',
                    lgKey,
                )
            )
        }
        req.body.eventDetails = eventDetails;
        // console.log({ userInfo, exhibitionData, eventDetails });
        next();

    } catch (error) {
        // console.log("🚀 ~ getUserInformationForIdCard ~ error:", error)
        return res.status(API_STATUS_CODE.INTERNAL_SERVER_ERROR).send(
            setServerResponse(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                'internal_server_error',
                lgKey,
            )
        )
    }
}

module.exports = {
    getUserInformationForIdCard
}