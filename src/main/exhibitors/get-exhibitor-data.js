/**
 * @author Md. Majedul Islam <https://github.com/majedul-uxbd>
 * Software Engineer,
 * Ultra-X BD Ltd.
 *
 * @copyright All right reserved Majedul All right reserved Md. Majedul Islam
 *
 * @description
 *
 */
const _ = require('lodash');
const { pool } = require('../../../database/db');
const { API_STATUS_CODE } = require('../../consts/error-status');
const { setRejectMessage } = require('../../common/set-reject-message');


const getExhibitorCompanyQuery = async (authData) => {
    const _query = `
    SELECT
        companies_id
    FROM 
        user
    WHERE
        id = ?;
    `;

    try {
        const [result] = await pool.query(_query, authData.id);
        if (result.length > 0) {
            return Promise.resolve(result[0].companies_id);
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


const getNumberOfRowsQuery = async (companyId) => {
    const _query = `
    SELECT count(*) AS totalRows
    FROM
        user
    WHERE
        companies_id = ? AND
        role = ?

    `;

    const _values = [
        companyId,
        'exhibitor'
    ];


    try {
        const [result] = await pool.query(_query, _values);
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

const getExhibitorDataQuery = async (companyId, paginationData) => {
    const query = `
	    SELECT
        user.id,
        user.f_name,
        user.l_name,
        user.email,
        user.contact_no,
        companies.name AS company_name,
        companies.website_link AS company_website_link,
        companies.address AS company_address,
        companies.email AS company_email,
        user.position,
        user.role,
        user.profile_img,
        user.is_user_active,
        user.created_at,
        user.updated_at
    FROM
        user
    LEFT JOIN
        companies
    ON companies.id = user.companies_id
    WHERE
        user.companies_id = ? AND
        companies.is_active = ${1} AND
        user.role = ?
    LIMIT ?
    OFFSET ?;
    `;

    const values = [
        companyId,
        'exhibitor',
        paginationData.itemsPerPage,
        paginationData.offset
    ];


    try {
        const [result] = await pool.query(query, values);
        if (result.length > 0) {
            return Promise.resolve(result);
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
};

const getExhibitorData = async (authData, paginationData) => {
    try {
        const companyId = await getExhibitorCompanyQuery(authData);
        if (!_.isNil(companyId)) {
            const totalRows = await getNumberOfRowsQuery(companyId);
            const exhibitorInfo = await getExhibitorDataQuery(companyId, paginationData);
            return Promise.resolve({
                metadata: {
                    totalRows: totalRows,
                },
                data: exhibitorInfo
            });
        }
    } catch (error) {
        // console.log("🚀 ~ userLogin ~ error:", error)
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.INTERNAL_SERVER_ERROR, 'Internal Server Error')
        );
    }
};
module.exports = {
    getExhibitorData,
};
