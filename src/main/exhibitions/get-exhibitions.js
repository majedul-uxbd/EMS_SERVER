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


const getExhibitionDataQuery = async (paginationData) => {
    const _query = `
    SELECT 
        id, 
        exhibitions_title,
        exhibition_dates,
        exhibition_venue,
        created_at
    FROM
        exhibitions;
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
 * @description This function is used to get all exhibitions information 
 */
const getExhibition = async (paginationData) => {

    try {
        const exhibitionInfo = await getExhibitionDataQuery(paginationData);
        return Promise.resolve({
            data: exhibitionInfo
        });
    } catch (error) {
        // console.log("🚀 ~ userLogin ~ error:", error)
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.INTERNAL_SERVER_ERROR, 'Internal Server Error')
        );
    }
};


module.exports = {
    getExhibition
}