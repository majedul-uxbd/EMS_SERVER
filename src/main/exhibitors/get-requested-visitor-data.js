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
        return Promise.reject(error);
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
        return Promise.reject(error);
    }
}


const getRequestedVisitorDataQuery = async (companyId, paginationData) => {
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
            ex.id AS exhibition_id,
            ex.exhibitions_title,
            ad.created_at
        FROM
            approved_document AS ad
        LEFT JOIN visitors AS visitor
        ON
            ad.visitor_id = visitor.id
        LEFT JOIN projects AS project
        ON
            ad.project_id = project.id
        LEFT JOIN
            exhibitions AS ex 
        ON ad.exhibition_id = ex.id
        WHERE
            ad.company_id = ?
        LIMIT ? OFFSET ?;
    `;
    const _values = [
        companyId,
        paginationData.itemsPerPage,
        paginationData.offset
    ]

    try {
        const [result] = await pool.query(_query, _values);
        return Promise.resolve(result);
    } catch (error) {
        return Promise.reject(error);
    }
}

/**
 * @description This function is used to get those visitor data who are requested for project document 
 */
const getRequestedVisitorData = async (authData, bodyData, paginationData) => {
    const lgKey = bodyData.lg;
    try {
        const companyId = await getCompanyId(authData);
        if (companyId) {
            const totalRows = await getNumberOfRowsQuery(companyId);
            const visitorData = await getRequestedVisitorDataQuery(companyId, paginationData);
            const result = {
                metadata: {
                    totalRows: totalRows,
                },
                visitorData
            };
            return Promise.resolve(
                setServerResponse(
                    API_STATUS_CODE.OK,
                    'get_data_successfully',
                    lgKey,
                    result
                )
            );
        }

    } catch (error) {
        return Promise.reject(
            setServerResponse(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                'internal_server_error',
                lgKey,
            )
        );
    }
}

module.exports = {
    getRequestedVisitorData
}