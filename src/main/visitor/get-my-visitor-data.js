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
const { API_STATUS_CODE } = require("../../consts/error-status");
const { setServerResponse } = require("../../common/set-server-response");

// Query to get all attendance data
const getVisitorOwnData = async (authData) => {
	const _query = `
	SELECT 
		f_name,
		l_name,
		email,
		contact_no,
		company,
		position,
		profile_img,
		created_at,
		updated_at
	FROM 
		visitors 
	WHERE
	  id = ?;
  `;

	try {
		const [result] = await pool.query(_query, authData.id);
		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(error);
	}
};

/**
 * @description This function is used to get visitor own information
 */
const getVisitorData = async (authData, bodyData) => {
	const lgKey = bodyData.lg;

	try {
		const visitorData = await getVisitorOwnData(authData);
		return Promise.resolve(
			setServerResponse(
				API_STATUS_CODE.OK,
				'get_data_successfully',
				lgKey,
				visitorData
			)
		);
	} catch (error) {
		// console.error("🚀 ~ getAllAttendanceData ~ error:", error);
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
	getVisitorData,
};
