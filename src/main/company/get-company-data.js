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

const _ = require("lodash");
const { pool } = require("../../../database/db");
const { setServerResponse } = require("../../common/set-server-response");
const { API_STATUS_CODE } = require("../../consts/error-status");


const getNumberOfRowsQuery = async () => {
    const _query = `
    SELECT count(*) AS totalRows
    FROM
        companies
    WHERE
        current_status IS NULL;
    `;

    try {
        const [result] = await pool.query(_query);
        return Promise.resolve(result[0]);
    } catch (error) {
        // console.log('🚀 ~ userLoginQuery ~ error:', error);
        return Promise.reject(error);
    }
}

const getCompanyDataQuery = async (paginationData) => {
    const _query = `
    SELECT
        id,
        name,
        website_link,
        address,
        email,
        is_active,
        created_at,
        updated_at
    FROM
        companies
    WHERE
        current_status IS NULL
    LIMIT ?
    OFFSET ?;
    `;


    const values = [paginationData.itemsPerPage, paginationData.offset];


    try {
        const [result] = await pool.query(_query, values);
        return Promise.resolve(result);
    } catch (error) {
        // console.log('🚀 ~ userLoginQuery ~ error:', error);
        return Promise.reject(error);
    }
}

/**
 * @description This function will get all company account information
 */
const getCompanyTableData = async (bodyData, paginationData) => {
    const lgKey = bodyData.lg;
    try {
        const totalRows = await getNumberOfRowsQuery();
        const companyData = await getCompanyDataQuery(paginationData);
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
        // console.log("🚀 ~ getAllUserTableData ~ error:", error)
        return Promise.reject(
            setServerResponse(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                'Internal_server_error',
                lgKey
            )
        );

    }
}

module.exports = {
    getCompanyTableData
}