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
const { setRejectMessage } = require("../../common/set-reject-message");
const { API_STATUS_CODE } = require("../../consts/error-status");

const getNumberOfRowsQuery = async () => {
	const _query = `
    SELECT count(*) AS totalRows
		FROM
		attendances
	LEFT JOIN(
		SELECT
			user.id AS id,
			NAME AS company,
			f_name,
			l_name,
			user.email AS email,
			contact_no,
			position,
			role
		FROM
			user
		LEFT JOIN companies ON user.companies_id = companies.id
	) AS user
	ON
		user.id = attendances.exhibitor_id
	LEFT JOIN(
		SELECT
			id,
			f_name,
			l_name,
			email,
			contact_no,
			company,
			position,
			role
		FROM
			visitors
	) AS visitors
	ON
		visitors.id = attendances.visitors_id
	LEFT JOIN user AS taken_by
	ON
		attendances.taken_by = taken_by.id;
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

const getAttendanceData = async (paginationData) => {
	const _query = `
	SELECT
			attendances.time,
			attendances.exhibitions_day,
			taken_by.f_name AS taken_by_f_name,
			taken_by.l_name AS taken_by_l_name,
		CASE WHEN user.id IS NULL THEN visitors.id ELSE user.id
		END AS id,
		CASE 
			WHEN user.id IS NULL THEN visitors.f_name 
			ELSE user.f_name
		END AS f_name,
		CASE 
			WHEN user.id IS NULL THEN visitors.l_name 
			ELSE user.l_name
		END AS l_name,
		CASE 
			WHEN user.id IS NULL THEN visitors.company 
			ELSE user.company
		END AS company,
		CASE 
			WHEN user.id IS NULL THEN visitors.position 
			ELSE user.position
		END AS position,
		CASE 
			WHEN user.id IS NULL THEN visitors.role 
			ELSE user.role
		END AS role
	FROM
		attendances
	LEFT JOIN(
		SELECT
			user.id AS id,
			NAME AS company,
			f_name,
			l_name,
			user.email AS email,
			contact_no,
			position,
			role
		FROM
			user
		LEFT JOIN companies ON user.companies_id = companies.id
	) AS user
	ON
		user.id = attendances.exhibitor_id
	LEFT JOIN(
		SELECT
			id,
			f_name,
			l_name,
			email,
			contact_no,
			company,
			position,
			role
		FROM
			visitors
	) AS visitors
	ON
		visitors.id = attendances.visitors_id
	LEFT JOIN user AS taken_by
	ON
		attendances.taken_by = taken_by.id
	LIMIT ?
    OFFSET ?;
  `;

	const _values = [
		paginationData.itemsPerPage,
		paginationData.offset
	]
	try {
		const [result] = await pool.query(_query, _values);
		return result
	} catch (error) {
		// console.log("🚀 ~ getAttendenceData ~ error:", error)
		return Promise.reject(error);
	}
}

/**
 * @description This function is used to get all attendance data
 */
const getAllAttendanceData = async (paginationData) => {

	try {
		const totalRows = await getNumberOfRowsQuery();
		const attendanceData = await getAttendanceData(paginationData);
		return Promise.resolve({
			metadata: {
				totalRows: totalRows,
			},
			data: attendanceData
		});
	} catch (error) {
		// console.error("🚀 ~ getAttendanceDetails ~ error:", error);
		throw setRejectMessage(
			API_STATUS_CODE.INTERNAL_SERVER_ERROR,
			"Failed to retrieve attendance details"
		);
	}
};
module.exports = {
	getAllAttendanceData,
};
