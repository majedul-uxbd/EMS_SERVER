const { pool } = require("../../../database/db");
const { setRejectMessage } = require("../../common/set-reject-message");
const { API_STATUS_CODE } = require("../../consts/error-status");



const getExhibitionDayIdByDate = async () => {
	const query = `
        SELECT id 
        FROM exhibition_days 
        WHERE exhibition_date = CURDATE();
    `;

	try {
		const [result] = await pool.query(query);
		return result.length > 0 ? result[0].id : null;
	} catch (error) {
		// console.error("🚀 ~ getExhibitionDayIdByDate ~ error:", error);
		return Promise.reject(
			setRejectMessage(
				API_STATUS_CODE.INTERNAL_SERVER_ERROR,
				"Failed to fetch exhibition day ID"
			)
		);
	}
};

/**
 * This function will check whether the visitor or exhibitor attendance has already taken or not
 */
const checkAttendanceAlreadyTaken = async (attendanceData) => {
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
		exhibitions_day = CURDATE() AND
		attend = ?;
  `;

	const _values = [
		attendanceData.visitors_id ||
		attendanceData.exhibitor_id,
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
            taken_by,
            visitors_id,
            exhibitor_id,
            attend,
            exhibitions_day,
			time,
            created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `;

	const _values = [
		attendanceData.exhibition_days_id,
		authData.id,
		attendanceData.visitors_id || null,
		attendanceData.exhibitor_id || null,
		1,
		attendanceData.exhibitionsDay,
		attendanceData.time,
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
		return Promise.reject(
			setRejectMessage(API_STATUS_CODE.BAD_REQUEST, "Operation failed")
		);
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
		return Promise.reject(
			setRejectMessage(
				API_STATUS_CODE.INTERNAL_SERVER_ERROR,
				"Validation failed"
			)
		);
	}
};

/**
 * This function is used to create attendance data
 */
const createAttendanceData = async (authData, attendanceData) => {
	// console.log({ authData, attendanceData })
	const createdAt = new Date();

	attendanceData = {
		...attendanceData,
		createdAt: createdAt,
		exhibitionsDay: createdAt,
		time: getUTCTime()
	};

	try {
		const exhibitionDayId = await getExhibitionDayIdByDate();
		if (!exhibitionDayId) {
			return Promise.reject(
				setRejectMessage(
					API_STATUS_CODE.BAD_REQUEST,
					"No exhibition matches the current date"
				)
			);
		}

		attendanceData.exhibition_days_id = exhibitionDayId;

		const isAttendeeValid = await validateAttendee(
			attendanceData.attendee_id,
			attendanceData.attendee_role
		);

		if (!isAttendeeValid) {
			return Promise.reject(
				setRejectMessage(
					API_STATUS_CODE.BAD_REQUEST,
					"Attendee is either inactive or not found"
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

		const isAttendanceAlreadyTaken = await checkAttendanceAlreadyTaken(attendanceData);
		if (isAttendanceAlreadyTaken) {
			return Promise.reject(
				setRejectMessage(
					API_STATUS_CODE.BAD_REQUEST,
					"Attendance already taken"
				)
			);
		}

		const isInsertData = await insertAttendanceDataQuery(
			authData,
			attendanceData
		);

		if (isInsertData) {
			return Promise.resolve({
				status: "success",
				message: "Attendance data successfully inserted",
			});
		}
	} catch (error) {
		// console.error("🚀 ~ createAttendanceData ~ error:", error);
		return Promise.reject(
			setRejectMessage(
				API_STATUS_CODE.INTERNAL_SERVER_ERROR,
				"Internal Server Error"
			)
		);
	}
};

module.exports = {
	createAttendanceData,
};
