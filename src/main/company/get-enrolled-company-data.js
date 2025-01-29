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

const getNumberOfRowsQuery = async (bodyData) => {
    const _query = `
    SELECT count(*) AS totalRows
    FROM
        companies AS c
    LEFT JOIN exhibitions_has_companies AS ehc
    ON
        c.id = ehc.company_id
    WHERE
        ehc.exhibition_id = ?;
    `;

    try {
        const [result] = await pool.query(_query, bodyData.exhibitionId);
        return Promise.resolve(result[0]);
    } catch (error) {
        // console.log('🚀 ~ userLoginQuery ~ error:', error);
        return Promise.reject(error);
    }
}

const getEnrolledCompanyDataQuery = async (bodyData, paginationData) => {
    const _query = `
    SELECT DISTINCT
        c.id,
        c.name,
        c.website_link,
        c.address,
        c.email,
        c.created_at,
        c.updated_at
    FROM
        companies AS c
    LEFT JOIN exhibitions_has_companies AS ehc
    ON
        c.id = ehc.company_id
    WHERE
        ehc.exhibition_id = ?
    LIMIT ?
    OFFSET ?;
    `;


    const values = [
        bodyData.exhibitionId,
        paginationData.itemsPerPage,
        paginationData.offset
    ];


    try {
        const [result] = await pool.query(_query, values);
        return Promise.resolve(result);
    } catch (error) {
        // console.log('🚀 ~ userLoginQuery ~ error:', error);
        return Promise.reject(error);
    }
}

/**
 * @description This function is used to get enrolled company data 
 */
const getEnrolledCompanyData = async (bodyData, paginationData) => {
    const lgKey = bodyData.lg;

    try {
        const totalRows = await getNumberOfRowsQuery(bodyData, paginationData);
        const companyData = await getEnrolledCompanyDataQuery(bodyData, paginationData);
        const result = {
            metadata: {
                totalRows: totalRows,
            },
            data: companyData
        }
        return Promise.resolve(
            setServerResponse(
                API_STATUS_CODE.OK,
                'get_data_successfully',
                lgKey,
                result
            )
        );
    } catch (error) {
        // console.log('🚀 ~ file: get-enrolled-company-data.js:96 ~ getEnrolledCompanyData ~ error:', error);
        return Promise.reject(
            setServerResponse(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                'internal_server_error',
                lgKey,
            ))
    }
}

module.exports = {
    getEnrolledCompanyData
}