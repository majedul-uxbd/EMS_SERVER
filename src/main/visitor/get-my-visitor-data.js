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
const { setRejectMessage } = require("../../common/set-reject-message");

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
		if (result.length > 0) {
			return Promise.resolve(result);
		} else {
			return Promise.reject(
				setRejectMessage(API_STATUS_CODE.NOT_FOUND, "No data found")
			);
		}
	} catch (error) {
		return Promise.reject(
			setRejectMessage(
				API_STATUS_CODE.INTERNAL_SERVER_ERROR,
				"Operation failed"
			)
		);
	}
};

/**
 * @description This function is used to get visitor own information
 */
const getVisitorData = async (authData) => {
	try {
		const attendanceData = await getVisitorOwnData(authData);
		return Promise.resolve({
			message: "Attendance data fetched successfully",
			data: attendanceData,
		});
	} catch (error) {
		// console.error("🚀 ~ getAllAttendanceData ~ error:", error);
		return Promise.reject(
			setRejectMessage(
				API_STATUS_CODE.INTERNAL_SERVER_ERROR,
				"Internal Server Error"
			)
		);
	}
};

module.exports = {
	getVisitorData,
};
