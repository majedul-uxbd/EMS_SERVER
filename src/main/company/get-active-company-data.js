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
const { setRejectMessage } = require("../../common/set-reject-message");
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
        return Promise.reject(
            setRejectMessage(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                'operation_failed'
            )
        );
    }
}

/**
 * @description This function will return active company account information
 */
const getActiveCompanyData = async () => {
    try {
        const result = await getCompanyDataQuery();

        return Promise.resolve({
            status: 'success',
            message: 'Get company data successfully',
            data: result
        });
    } catch (error) {
        // console.log("🚀 ~ getAllUserTableData ~ error:", error)
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.INTERNAL_SERVER_ERROR, 'Internal server error')
        );

    }
}

module.exports = {
    getActiveCompanyData
}