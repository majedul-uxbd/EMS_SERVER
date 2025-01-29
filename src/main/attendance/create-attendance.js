const _ = require('lodash');
const { pool } = require("../../../database/db");
const { setServerResponse } = require("../../common/set-server-response");
const { API_STATUS_CODE } = require("../../consts/error-status");


const checkIsOrganizerEnrolled = async (authData, attendanceData) => {
	const query = `
        SELECT 
			id
        FROM 
			exhibitions_has_organizer 
        WHERE 
			exhibition_id = ? AND
			organizer_id = ?;
    `;

	const values = [
		attendanceData.exhibitionId,
		authData.id
	]
	try {
		const [result] = await pool.query(query, values);
		return result.length > 0 ? true : false;
	} catch (error) {
		// console.error("🚀 ~ getExhibitionDayIdByDate ~ error:", error);
		return Promise.reject(error);
	}
};


const getExhibitionDayIdByDate = async (exhibitionId) => {
	const query = `
        SELECT 
			id,
			exhibition_date
        FROM 
			exhibition_days 
        WHERE 
			exhibitions_id = ?;
    `;

	try {
		const [result] = await pool.query(query, exhibitionId);
		return result.length > 0 ? result : null;
	} catch (error) {
		// console.error("🚀 ~ getExhibitionDayIdByDate ~ error:", error);
		return Promise.reject(error);
	}
};

/**
 * This function will check whether the visitor or exhibitor attendance has already taken or not
 */
const checkAttendanceAlreadyTaken = async (attendanceData, dayId) => {
	let attendeeId = '';
	if (attendanceData.visitors_id !== null) {
		attendeeId = 'visitors_id';
		delete attendanceData.exhibitor_id;
	} else {
		attendeeId = 'exhibitor_id';
		delete attendanceData.visitors_id;

	}

	const _query = `
    SELECT
      	id
    FROM
      	attendances
	WHERE
		${attendeeId} = ? AND
		exhibition_days_id = ? AND
		attend = ?;
  `;

	const _values = [
		attendanceData.visitors_id ||
		attendanceData.exhibitor_id,
		dayId,
		1
	]
	// console.log({ _query, _values });
	try {
		const [result] = await pool.query(_query, _values);
		if (result.length > 0) {
			return true;
		} return false;
	} catch (error) {
		// console.log("🚀 ~ checkAttendanceAlreadyTaken ~ error:", error)
		return Promise.reject(error);
	}
}

/**
 * This function is used to insert attendance data into the DB 
 */
const insertAttendanceDataQuery = async (authData, attendanceData) => {
	const _query = `
        INSERT INTO attendances (
            exhibition_days_id,
            visitors_id,
            exhibitions_day,
			time,
            exhibitor_id,
            taken_by,
            attend,
            created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `;

	const _values = [
		attendanceData.exhibition_days_id,
		attendanceData.visitors_id || null,
		attendanceData.exhibitionsDay,
		attendanceData.time,
		attendanceData.exhibitor_id || null,
		authData.id,
		1,
		attendanceData.createdAt,
	];

	try {
		const [result] = await pool.query(_query, _values);
		if (result.affectedRows > 0) {
			return true;
		} else {
			return false;
		}
	} catch (error) {
		// console.error("🚀 ~ insertAttendanceDataQuery ~ error:", error);
		return Promise.reject(error);
	}
};

const getUTCTime = () => {
	const utcTime = new Date().toISOString().substr(11, 8);
	return utcTime;
};

// Validate the attendee (either a visitor or exhibitor)
const validateAttendee = async (attendee_id, attendee_role) => {
	let query = "";
	if (attendee_role === "visitor") {
		query = `SELECT id FROM visitors WHERE id = ? AND role = ? AND is_user_active = ${1}`;
	} else {
		query = `SELECT id FROM user WHERE id = ? AND role = ? AND is_user_active = ${1}`;
	}


	const _values = [
		attendee_id,
		attendee_role
	]
	try {
		const [result] = await pool.query(query, _values);
		if (result.length > 0) {
			return true;
		} else {
			return false;
		}
	} catch (error) {
		//console.error("🚀 ~ validateAttendee ~ error:", error);
		return Promise.reject(error);
	}
};


/**
 * This function is used to create attendance data
 */
const createAttendanceData = async (authData, attendanceData) => {
	const lgKey = attendanceData.lg;
	const today = new Date();
	let startDate;
	let endDate;
	let dayId;
	// console.log({ authData, attendanceData })
	if (attendanceData.attendee_role !== "visitor" &&
		attendanceData.attendee_role !== "exhibitor" &&
		attendanceData.attendee_role !== "exhibitor_admin") {
		return Promise.reject(
			setServerResponse(
				API_STATUS_CODE.BAD_REQUEST,
				'invalid_attendee_role',
				lgKey
			)
		)
	}
	if (_.isNil(attendanceData.exhibitionId)) {
		return Promise.reject(
			setServerResponse(
				API_STATUS_CODE.BAD_REQUEST,
				'exhibition_id_is_required',
				lgKey
			)
		)
	}

	if (_.isNil(attendanceData.attendee_id)) {
		return Promise.reject(
			setServerResponse(
				API_STATUS_CODE.BAD_REQUEST,
				'attendee_id_is_required',
				lgKey
			)
		)
	}

	const createdAt = new Date();

	attendanceData = {
		...attendanceData,
		createdAt: createdAt,
		exhibitionsDay: createdAt,
		time: getUTCTime()
	};

	try {
		const isOrganizerEnrolled = await checkIsOrganizerEnrolled(authData, attendanceData);
		if (!isOrganizerEnrolled) {
			return Promise.reject(
				setServerResponse(
					API_STATUS_CODE.BAD_REQUEST,
					'you_are_not_assigned_in_this_exhibition',
					lgKey
				)
			)
		}

		const exhibitionDayInfo = await getExhibitionDayIdByDate(attendanceData.exhibitionId);
		if (_.isNil(exhibitionDayInfo)) {
			return Promise.reject(
				setServerResponse(
					API_STATUS_CODE.BAD_REQUEST,
					'exhibition_is_not_found',
					lgKey,
				)
			)
		}
		startDate = exhibitionDayInfo[0]?.exhibition_date;
		endDate = exhibitionDayInfo[exhibitionDayInfo.length - 1]?.exhibition_date;

		const normalizedToday = new Date(today).toISOString().split('T')[0];

		// Check if any exhibition_date matches today's date
		const isMatch = exhibitionDayInfo.some(day => {
			const exhibitionDate = new Date(day.exhibition_date).toISOString().split('T')[0];
			dayId = day.id;
			return exhibitionDate === normalizedToday;
		});

		if (!isMatch) {
			return Promise.reject(
				setServerResponse(
					API_STATUS_CODE.BAD_REQUEST,
					`this_is_not_your_current_enrolled_exhibition`,
					lgKey,
				)
			);
		}
		// console.log({ currentDate: dayId })
		attendanceData.exhibition_days_id = dayId;

		const isAttendeeValid = await validateAttendee(
			attendanceData.attendee_id,
			attendanceData.attendee_role
		);

		if (!isAttendeeValid) {
			return Promise.reject(
				setServerResponse(
					API_STATUS_CODE.BAD_REQUEST,
					'no_user_found_or_user_is_not_active',
					lgKey,
				)
			);
		}

		// Assign the correct ID based on the attendee role (visitor or exhibitor)
		if (attendanceData.attendee_role === "visitor") {
			attendanceData.visitors_id = attendanceData.attendee_id;
			attendanceData.exhibitor_id = null;
		} else if (attendanceData.attendee_role === "exhibitor" || attendanceData.attendee_role === "exhibitor_admin") {
			attendanceData.exhibitor_id = attendanceData.attendee_id;
			attendanceData.visitors_id = null;
		}

		const isAttendanceAlreadyTaken = await checkAttendanceAlreadyTaken(attendanceData, dayId);
		if (isAttendanceAlreadyTaken) {
			return Promise.reject(
				setServerResponse(
					API_STATUS_CODE.BAD_REQUEST,
					'attendance_already_taken',
					lgKey,
				)
			);
		}

		const isInsertData = await insertAttendanceDataQuery(
			authData,
			attendanceData
		);

		if (isInsertData) {
			return Promise.resolve(
				setServerResponse(
					API_STATUS_CODE.OK,
					'attendance_data_successfully_taken',
					lgKey,
				)
			);
		}
	} catch (error) {
		// console.error("🚀 ~ createAttendanceData ~ error:", error);
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
	createAttendanceData,
};
