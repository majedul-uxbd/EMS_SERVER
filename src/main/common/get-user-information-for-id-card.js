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
const { API_STATUS_CODE } = require("../../consts/error-status");

const getUserInformation = async (authData) => {
    let _query;
    const _query1 = `
    SELECT
        id,
        f_name,
        l_name,
        role,
        company AS company_name,
        position
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
        users.position
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
        return false;
    } catch (error) {
        // console.log("🚀 ~ getUserInformation ~ error:", error)
        return error;
    }
};

//TODO:
const getExhibitionsDate = async (authData) => {
    const _query = `
        SELECT
            exhibition.exhibitions_title,
            exhibition.exhibition_dates,
            exhibition.exhibition_venue
        FROM
            exhibitions AS exhibition
        LEFT JOIN exhibitions_has_visitor AS ev
        ON
            exhibition.id = ev.exhibitions_id
        WHERE
            ev.visitor_id = ?;
    `;

    try {
        const [result] = await pool.query(_query, authData.id);
        if (result.length > 0) {
            return result[0]
        }
        return false;
    } catch (error) {
        // console.log("🚀 ~ getUserInformation ~ error:", error)
        return error;
    }
}


const getUserInformationForIdCard = async (req, res, next) => {
    const authUser = req.auth;
    try {
        const userInfo = await getUserInformation(authUser);
        const exhibitionData = await getExhibitionsDate(authUser);
        if (userInfo && exhibitionData) {
            req.body.user = userInfo;
            req.body.exhibitionData = exhibitionData;
            next();
        }
        else {
            return res.status(API_STATUS_CODE.BAD_REQUEST).send({
                status: 'failed',
                message: 'User is not found or not enrolled any exhibition'
            })
        }
    } catch (error) {
        // console.log("🚀 ~ getUserInformationForIdCard ~ error:", error)
        return res.status(API_STATUS_CODE.INTERNAL_SERVER_ERROR).send({
            status: 'failed',
            message: 'Internal server error'
        })
    }
}

module.exports = {
    getUserInformationForIdCard
}