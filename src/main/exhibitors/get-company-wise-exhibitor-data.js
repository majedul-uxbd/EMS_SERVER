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


const getCompanyWiseExhibitorDataQuery = async (companyId) => {
    const query = `
	    SELECT
            u.id,
            u.f_name,
            u.l_name,
            u.email,
            u.role,
            u.contact_no,
            c.name AS company_name,
            u.position,
            u.is_user_active,
            u.created_at,
            u.updated_at
        FROM
            user AS u
        LEFT JOIN companies AS c
        ON
            u.companies_id = c.id
        WHERE
            u.role IN ('exhibitor', 'exhibitor_admin') AND
            u.companies_id = ?;
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
const getCompanyWiseExhibitorData = async (bodyData) => {
    const lgKey = bodyData.lg;

    try {
        if (!_.isNil(bodyData.companyId)) {
            const exhibitorData = await getCompanyWiseExhibitorDataQuery(bodyData.companyId);
            return Promise.resolve(
                setServerResponse(
                    API_STATUS_CODE.OK,
                    'get_data_successfully',
                    lgKey,
                    exhibitorData
                )
            );
        } else {
            return Promise.reject(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'company_id_is_required',
                    lgKey
                )
            );
        }
    } catch (error) {
        // console.log("🚀 ~ userLogin ~ error:", error)
        return Promise.reject(
            setServerResponse(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                'internal_server_error',
                lgKey
            )
        );
    }
};
module.exports = {
    getCompanyWiseExhibitorData,
};
