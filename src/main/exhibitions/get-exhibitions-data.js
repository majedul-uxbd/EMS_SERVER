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
const { format } = require('date-fns');

const { setRejectMessage } = require("../../common/set-reject-message");
const { API_STATUS_CODE } = require("../../consts/error-status");


const getNumberOfRowsQuery = async () => {
    const _query = `
    SELECT count(*) AS totalRows
    FROM
        exhibitions;
    `;


    try {
        const [result] = await pool.query(_query);
        return Promise.resolve(result[0]);
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


const getExhibitionDataQuery = async (paginationData) => {
    const _query = `
    SELECT 
        id, 
        exhibitions_title,
        exhibition_dates,
        exhibition_venue,
        created_at
    FROM
        exhibitions
    LIMIT ?
    OFFSET ?;
    `;

    const _values = [
        paginationData.itemsPerPage,
        paginationData.offset
    ];


    try {
        const [result] = await pool.query(_query, _values);
        return Promise.resolve(result);
    } catch (error) {
        console.log('🚀 ~ userLoginQuery ~ error:', error);
        return Promise.reject(
            setRejectMessage(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                'operation_failed'
            )
        );
    }
}


/**
 * @description This function is used to get all exhibitions data 
 */
const getExhibitionData = async (paginationData) => {

    try {
        const totalRows = await getNumberOfRowsQuery();
        const exhibitionInfo = await getExhibitionDataQuery(paginationData);
        return Promise.resolve({
            metadata: {
                totalRows: totalRows,
            },
            data: exhibitionInfo
        });
    } catch (error) {
        console.log("🚀 ~ userLogin ~ error:", error)
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.INTERNAL_SERVER_ERROR, 'Internal Server Error')
        );
    }
};


module.exports = {
    getExhibitionData
}