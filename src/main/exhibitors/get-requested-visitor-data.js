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


const getCompanyId = async (authData) => {
    const _query = `
    SELECT
        companies_id
    FROM
        user
    WHERE
        id = ?;
    `;

    try {
        const [result] = await pool.query(_query, authData.id);
        if (result.length > 0) {
            return result[0].companies_id;
        }
    } catch (error) {
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Operation failed')
        );
    }
}


const getNumberOfRowsQuery = async (companyId) => {
    const _query = `
        SELECT count(*) AS totalRows
        FROM
            approved_document AS ad
        LEFT JOIN visitors AS visitor
        ON
            ad.visitor_id = visitor.id
        LEFT JOIN
            projects as project
            ON 
            ad.project_id = project.id
        WHERE
            ad.company_id = ?;
    `;

    try {
        const [result] = await pool.query(_query, companyId);
        return result[0];
    } catch (error) {
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Operation failed')
        );
    }
}


const getRequestedVisitorDataQuery = async (companyId) => {
    const _query = `
        SELECT
            visitor.f_name,
            visitor.l_name,
            visitor.email,
            visitor.contact_no,
            visitor.company AS company_name,
            visitor.position,
            project.id,
            project.project_name,
            ad.created_at
        FROM
            approved_document AS ad
        LEFT JOIN 
            visitors AS visitor
        ON
            ad.visitor_id = visitor.id
        LEFT JOIN
            projects as project
        ON 
            ad.project_id = project.id
        WHERE
            ad.company_id = ?;
    `;

    try {
        const [result] = await pool.query(_query, companyId);
        if (result.length > 0) {
            return result;
        }
    } catch (error) {
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Operation failed')
        );
    }
}

/**
 * @description This function is used to get those visitor data who are requested for project document 
 */
const getRequestedVisitorData = async (authData) => {
    try {
        const companyId = await getCompanyId(authData);
        if (companyId) {
            const totalRows = await getNumberOfRowsQuery(companyId);
            const visitorData = await getRequestedVisitorDataQuery(companyId);
            return Promise.resolve({
                metadata: {
                    totalRows: totalRows,
                },
                data: visitorData
            });
        }

    } catch (error) {
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.INTERNAL_SERVER_ERROR, 'Internal Server Error')
        );
    }
}

module.exports = {
    getRequestedVisitorData
}