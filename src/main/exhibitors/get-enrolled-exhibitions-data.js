/**
 * @author Md. Majedul Islam <https://github.com/majedul-uxbd>
 * Software Engineer,
 * Ultra-X BD Ltd.
 *
 * @copyright All right reserved Md. Majedul Islam
 *
 * @description
 *
 */
const _ = require('lodash');
const { pool } = require('../../../database/db');
const { API_STATUS_CODE } = require('../../consts/error-status');
const { setServerResponse } = require('../../common/set-server-response');


const getCompanyIdQuery = async (authData) => {
    const query = `
	    SELECT
            companies_id
        FROM
            user
        WHERE
            id = ?;
    `;

    const values = [
        authData.id
    ];

    try {
        const [result] = await pool.query(query, values);
        return Promise.resolve(result[0].companies_id);
    } catch (error) {
        // console.log('🚀 ~ userLoginQuery ~ error:', error);
        return Promise.reject(error);
    }
};


const getEnrolledExhibitionDataQuery = async (companyId) => {
    const query = `
	    SELECT
            ex.id,
            ex.exhibitions_title
        FROM
            exhibitions AS ex
        LEFT JOIN exhibitions_has_companies AS ehc
        ON
            ex.id = ehc.exhibition_id
        WHERE
            ehc.company_id = ?;
    `;

    const values = [
        companyId
    ];

    try {
        const [result] = await pool.query(query, values);
        return Promise.resolve(result);
    } catch (error) {
        // console.log('🚀 ~ userLoginQuery ~ error:', error);
        return Promise.reject(error);
    }
};

/**
 * @description This function is used to get exhibitor data
 */
const getEnrollExhibitionData = async (authData, bodyData) => {
    const lgKey = bodyData.lg;

    try {
        const companyId = await getCompanyIdQuery(authData);
        if (_.isNil(companyId)) {
            return Promise.reject(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'company_not_found',
                    lgKey
                )
            )
        }
        const exhibitionData = await getEnrolledExhibitionDataQuery(companyId);
        return Promise.resolve(
            setServerResponse(
                API_STATUS_CODE.OK,
                'get_data_successfully',
                lgKey,
                exhibitionData
            )
        );

    } catch (error) {
        // console.log("🚀 ~ userLogin ~ error:", error)
        return Promise.reject(
            setServerResponse(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                'internal_server_error',
                lgKey,
            )
        );
    }
};
module.exports = {
    getEnrollExhibitionData,
};
