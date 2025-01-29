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

const getNumberOfRowsQuery = async (userData) => {
	let _query = `
    SELECT count(*) AS totalRows
    FROM
        user
    LEFT JOIN
        companies
    ON companies.id = user.companies_id
    WHERE
    `;

	if (
		userData.role === 'exhibitor' ||
		userData.role === 'exhibitor_admin'
	) {
		_query += `companies.is_active = ${1}
         AND user.role IN (?, 'exhibitor_admin')`;
	} else if (userData.role === 'organizer') {
		_query += `user.role = ?`;
	}

	const values = [
		userData.role
	];

	try {
		const [result] = await pool.query(_query, values);
		return Promise.resolve(result);
	} catch (error) {
		// console.log('🚀 ~ userLoginQuery ~ error:', error);
		return Promise.reject(error);
	}
};

const getUserDataQuery = async (userData, paginationData) => {
	let query;

	const _query1 = `
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
        companies.is_active = ${1}
        AND user.role IN (?, 'exhibitor_admin')
    LIMIT ? OFFSET ?;
    `;

	const _query2 = `
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
        ex.id AS enrolled_exhibition_id,
        ex.exhibitions_title AS enrolled_exhibition_title,
        ex.exhibition_dates AS enrolled_exhibition_dates,
        ex.exhibition_venue AS enrolled_exhibition_venue,
        user.position,
        user.role,
        user.profile_img,
        user.is_user_active,
        user.created_at,
        user.updated_at
    FROM
        user
    LEFT JOIN companies ON companies.id = user.companies_id
    LEFT JOIN exhibitions_has_organizer AS eho
    ON user.id = eho.organizer_id
    LEFT JOIN exhibitions AS ex 
    ON eho.exhibition_id =ex.id
    WHERE
        user.role = ?
    LIMIT ? OFFSET ?;
    `;

	if (
		userData.role === 'exhibitor' ||
		userData.role === 'exhibitor_admin'
	) {
		query = _query1;
	} else if (userData.role === 'organizer') {
		query = _query2;
	}

	const values = [
		userData.role,
		paginationData.itemsPerPage,
		paginationData.offset,
	];

	// return
	try {
		const [result] = await pool.query(query, values);
		return Promise.resolve(result);
	} catch (error) {
		// console.log('🚀 ~ userLoginQuery ~ error:', error);
		return Promise.reject(error);
	}
};

/**
 * This function will return all user data
 */
const getAllUserTableData = async (userData, paginationData) => {
	const lgKey = userData.lg;
	const today = new Date();

	try {
		const totalRows = await getNumberOfRowsQuery(userData, paginationData);
		const getUserData = await getUserDataQuery(userData, paginationData);

		// if (userData.role === 'system_admin' || userData.role === 'organizer') {
		// 	const exhibitionWiseUserData = getUserData.filter(exhibition => {
		// 		let hasExhibitionDate = true;
		// 		try {
		// 			const dates = JSON.parse(exhibition.enrolled_exhibition_dates);
		// 			if (dates) {
		// 				// Check if the first date is after or equal to today
		// 				const normalizedToday = new Date(
		// 					today.getFullYear(),
		// 					today.getMonth(),
		// 					today.getDate()
		// 				);
		// 				hasExhibitionDate = new Date(dates[0]) >= normalizedToday;
		// 			}
		// 		} catch (error) {
		// 			// If JSON parsing fails, keep hasExhibitionDate as true
		// 			hasExhibitionDate = true;
		// 		}
		// 		return hasExhibitionDate;
		// 	});

		// 	if (exhibitionWiseUserData.length > 0) {
		// 		const result = {
		// 			metadata: {
		// 				totalRows: exhibitionWiseUserData.length,
		// 			},
		// 			data: exhibitionWiseUserData,
		// 		};
		// 		return Promise.resolve(
		// 			setServerResponse(
		// 				API_STATUS_CODE.OK,
		// 				'get_data_successfully',
		// 				lgKey,
		// 				result
		// 			))
		// 	} else {
		// 		return Promise.reject(
		// 			setServerResponse(
		// 				API_STATUS_CODE.OK,
		// 				'get_data_successfully',
		// 				lgKey
		// 			)
		// 		)
		// 	}
		// }
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
	getAllUserTableData,
};
