/**
 * @author Md. Majedul Islam <https://github.com/majedul-uxbd> 
 * Software Engineer,
 * Ultra-X BD Ltd.
 *
 * @copyright All right reserved Majedul
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
        visitors
    WHERE
        is_user_active = ${1}
    `;


    try {
        const [result] = await pool.query(_query);
        if (result.length > 0) {
            return Promise.resolve(result[0]);
        } else {
            return Promise.reject(
                setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'User not found')
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

const getVisitorDataQuery = async (paginationData) => {
    const _query = `
    SELECT
        id,
        f_name,
        l_name,
        email,
        contact_no,
        company,
        position,
        role,
        profile_img,
        created_at,
        updated_at
    FROM
        visitors
    WHERE
        is_user_active = ${1}
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

const getAllVisitorTableData = async (paginationData) => {
    try {
        const totalRows = await getNumberOfRowsQuery();
        const result = await getVisitorDataQuery(paginationData);

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
    getAllVisitorTableData
}