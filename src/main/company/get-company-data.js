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
        if (result.length > 0) {
            return Promise.resolve(result[0]);
        } else {
            return Promise.reject(
                setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Company not found')
            )
        }
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
        return Promise.reject(
            setRejectMessage(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                'operation_failed'
            )
        );
    }
}

/**
 * @description This function will get all company account information
 */
const getCompanyTableData = async (paginationData) => {
    try {
        const totalRows = await getNumberOfRowsQuery();
        const result = await getCompanyDataQuery(paginationData);

        return Promise.resolve({
            metadata: {
                totalRows: totalRows,
            },
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
    getCompanyTableData
}