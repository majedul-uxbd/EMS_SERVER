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

const _ = require('lodash');
const { pool } = require('../../../database/db');
const { setServerResponse } = require('../../common/set-server-response');
const { API_STATUS_CODE } = require('../../consts/error-status');

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
		return Promise.resolve(result[0]);
	} catch (error) {
		// console.log('🚀 ~ userLoginQuery ~ error:', error);
		return Promise.reject(error);
	}
};

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
		return Promise.reject(error);
	}
};

/**
 * @description This function will return all visitor data
 */
const getAllVisitorTableData = async (userData, paginationData) => {
	const lgKey = userData.lg;
	try {
		const totalRows = await getNumberOfRowsQuery();
		const getUserData = await getVisitorDataQuery(paginationData);
		const result = {
			metadata: {
				totalRows: totalRows,
			},
			data: getUserData,
		};
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
};

module.exports = {
	getAllVisitorTableData,
};
