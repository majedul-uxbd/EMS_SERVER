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

const getUserDataQuery = async (id) => {
	const query = `
	SELECT
        u.id,
        u.companies_id,
		u.f_name,
        u.l_name,
        u.email,
        c.name AS company,
        c.website_link AS website,
        c.address AS company_address,
        c.email AS company_email,
        u.contact_no,
        u.position,
        u.role,
        u.profile_img
	FROM
		user u
  LEFT JOIN companies c ON c.id = u.companies_id
	WHERE
		u.id = ?;
	`;
	const values = [id];

	try {
		const [result] = await pool.query(query, values);
		return Promise.resolve(result[0]);
	} catch (error) {
		// console.log('🚀 ~ userLoginQuery ~ error:', error);
		return Promise.reject(error);
	}
};

const getVisitorDataQuery = async (id) => {
	const query = `
	SELECT
        id,
		f_name,
        l_name,
        email,
        company,
        contact_no,
        position,
        profile_img
	FROM
		visitors
	WHERE
		id = ?;
	`;
	const values = [id];

	try {
		const [result] = await pool.query(query, values);
		return Promise.resolve(result[0]);
	} catch (error) {
		// console.log('🚀 ~ userLoginQuery ~ error:', error);
		return Promise.reject(error);
	}
};

/**
 * This function is used to  get visitor and user information
 */
const getUserData = async (user, bodyData) => {
	const lgKey = bodyData.lg;

	let userInfo;

	try {
		if (user.role === 'visitor') {
			userInfo = await getVisitorDataQuery(user.id);
			userInfo = { ...userInfo, role: 'visitor' };
		} else {
			userInfo = await getUserDataQuery(user.id);
		}
	} catch (error) {
		// console.log("🚀 ~ userLogin ~ error:", error)
		return Promise.reject(error);
	}
	if (!userInfo) {
		return Promise.reject(
			setServerResponse(
				API_STATUS_CODE.BAD_REQUEST,
				'user_not_found',
				lgKey
			)

		);
	}

	return Promise.resolve(
		setServerResponse(
			API_STATUS_CODE.OK,
			'get_data_successfully',
			lgKey,
			userInfo
		)
	);
};
module.exports = {
	getUserData,
};
