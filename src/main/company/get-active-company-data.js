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


const getCompanyDataQuery = async () => {
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
        is_active = ${1}
    `;

    try {
        const [result] = await pool.query(_query);
        return Promise.resolve(result);
    } catch (error) {
        // console.log('🚀 ~ userLoginQuery ~ error:', error);
        return Promise.reject(error);
    }
}

/**
 * @description This function will return active company account information
 */
const getActiveCompanyData = async (bodyData) => {
    const lgKey = bodyData.lg;
    try {
        const result = await getCompanyDataQuery();

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
                'internal_server_error',
                lgKey
            )
        );

    }
}

module.exports = {
    getActiveCompanyData
}