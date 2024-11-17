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
const { API_STATUS_CODE } = require("../../consts/error-status");


const checkIfUserIsEnrolledInAExhibitionQuery = async (authData, bodyData) => {
    let _query = '';
    let _values = [];
    const _visitorQuery = `
        SELECT
            id
        FROM
            exhibitions_has_visitor
        WHERE
            visitor_id = ? AND
            exhibition_id = ?;
    `;

    const _exhibitorQuery = `
        SELECT
            ehc.id
        FROM
            exhibitions_has_companies as ehc
        LEFT JOIN
            user as u
        ON ehc.company_id = u.companies_id
        WHERE
            u.id = ? AND
            u.role = ? AND
            ehc.exhibition_id = ?;
    `;
    if (authData.role === 'visitor') {
        _query = _visitorQuery;
        _values = [
            authData.id,
            bodyData.exhibitionId
        ];
    } else {
        _query = _exhibitorQuery;
        _values = [
            authData.id,
            authData.role,
            bodyData.exhibitionId
        ];
    }

    try {
        const [result] = await pool.query(_query, _values);
        if (result.length > 0) {
            return true;
        }
        return false;
    } catch (error) {
        return Promise.reject(error);
    }

}


const checkIfUserIsEnrolledInAExhibition = async (req, res, next) => {
    const authData = req.auth;
    const bodyData = req.body;

    if (authData.role === 'organizer') {
        next();
    }
    else if (authData.role === 'visitor' || authData.role === 'exhibitor') {
        const isEnrolled = await checkIfUserIsEnrolledInAExhibitionQuery(authData, bodyData);
        if (isEnrolled) {
            next();
        } else {
            return res.status(API_STATUS_CODE.BAD_REQUEST).send({
                status: 'failed',
                message: 'You are not enrolled in this exhibition'
            })
        }
    } else {
        return res.status(API_STATUS_CODE.BAD_REQUEST).send({
            status: 'failed',
            message: 'You are not allowed to generate an ID card'
        })
    }
}

module.exports = {
    checkIfUserIsEnrolledInAExhibition
}