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
const { setServerResponse } = require("../../common/set-server-response");
const { API_STATUS_CODE } = require("../../consts/error-status");

const getNumberOfRowsQuery = async (authData) => {
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
		attendances.taken_by = taken_by.id
	LEFT JOIN exhibition_days AS ed
	ON
		attendances.exhibition_days_id = ed.id
	LEFT JOIN
		exhibitions AS ex
	ON
		ed.exhibitions_id = ex.id
    LEFT JOIN
        exhibitions_has_organizer AS eho
    ON ex.id = eho.exhibition_id
	WHERE 
    	eho.organizer_id = ?
    `;

	try {
		const [result] = await pool.query(_query, authData.id);
		return Promise.resolve(result[0]);
	} catch (error) {
		// console.log('🚀 ~ userLoginQuery ~ error:', error);
		return Promise.reject(error);
	}
}

const getAttendanceData = async (authData, paginationData) => {
	const _query = `
	SELECT
		attendances.time,
		attendances.exhibitions_day,
		taken_by.f_name AS taken_by_f_name,
		taken_by.l_name AS taken_by_l_name,
		ex.id AS exhibition_id,
		ex.exhibitions_title AS exhibition_name,
		CASE WHEN user.id IS NULL THEN visitors.id ELSE user.id
	END AS id,
	CASE WHEN user.id IS NULL THEN visitors.f_name ELSE user.f_name
	END AS f_name,
	CASE WHEN user.id IS NULL THEN visitors.l_name ELSE user.l_name
	END AS l_name,
	CASE WHEN user.id IS NULL THEN visitors.company ELSE user.company
	END AS company,
	CASE WHEN user.id IS NULL THEN visitors.position ELSE user.position
	END AS position,
	CASE WHEN user.id IS NULL THEN visitors.role ELSE user.role
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
	LEFT JOIN exhibition_days AS ed
	ON
		attendances.exhibition_days_id = ed.id
	LEFT JOIN
		exhibitions AS ex
	ON
		ed.exhibitions_id = ex.id
    LEFT JOIN
        exhibitions_has_organizer AS eho
    ON ex.id = eho.exhibition_id
	WHERE 
    	eho.organizer_id = ?
	LIMIT ?
    OFFSET ?;
  `;

	const _values = [
		authData.id,
		paginationData.itemsPerPage,
		paginationData.offset
	]
	try {
		const [result] = await pool.query(_query, _values);
		return Promise.resolve(result)
	} catch (error) {
		// console.log('🚀 ~ file: get-all-attendance.js:148 ~ getAttendanceData ~ error:', error);
		return Promise.reject(error);
	}
}

/**
 * @description This function is used to get all attendance data
 */

const getAllAttendanceData = async (authData, bodyData, paginationData) => {
	const lgKey = bodyData.lg;
	try {
		const totalRows = await getNumberOfRowsQuery(authData);
		const attendanceData = await getAttendanceData(authData, paginationData);
		const result = {
			metadata: {
				totalRows: totalRows,
			},
			attendanceData
		}
		return Promise.resolve(
			setServerResponse(
				API_STATUS_CODE.OK,
				'get_data_successfully',
				lgKey,
				result
			)
		);
	} catch (error) {
		// console.error("🚀 ~ getAttendanceDetails ~ error:", error);
		return Promise.reject(
			setServerResponse(
				API_STATUS_CODE.INTERNAL_SERVER_ERROR,
				'internal_server_error',
				lgKey,
			)
		)
	}
};
module.exports = {
	getAllAttendanceData,
};
