const { pool } = require("../../../database/db");
const { setRejectMessage } = require("../../common/set-reject-message");
const { API_STATUS_CODE } = require("../../consts/error-status");

const insertDataQuery = async (bodyData) => {
	const query = `
    INSERT INTO
        exhibitions
        (
            exhibitions_title,
            exhibition_venue,
            exhibition_dates,
            created_at
        )
    VALUES (?, ?, ?, ?);
    `;

	const values = [
		bodyData.exhibitionTitle,
		bodyData.exhibitionVenue,
		JSON.stringify(bodyData.exhibitionDates),
		bodyData.createdAt,
	];

	try {
		const [result] = await pool.query(query, values);
		if (result.affectedRows > 0) {
			return result.insertId;
		}
	} catch (error) {
		return Promise.reject(error);
	}
};

const insertExhibitionDay = async (
	exhibitionId,
	dayTitle,
	exhibitionDate,
	createdAt
) => {
	const query = `
    INSERT INTO
        exhibition_days
        (
            exhibitions_id,
            day_title,
            exhibition_date,
            created_at
        )
    VALUES (?, ?, ?, ?);
    `;

	const values = [exhibitionId, dayTitle, exhibitionDate, createdAt];

	try {
		const [result] = await pool.query(query, values);
		return result.affectedRows === 1;
	} catch (error) {
		return Promise.reject(error);
	}
};

const processExhibitionDates = (datesArray) => {
	const sortedDates = datesArray.sort((a, b) => new Date(a) - new Date(b));

	return sortedDates.map((date, index) => ({
		dayTitle: `Day ${index + 1}`,
		exhibitionDate: date,
	}));
};

const addExhibitionsInfo = async (bodyData) => {

	const createdAt = new Date();

	const newBodyData = {
		exhibitionTitle: bodyData.exhibitionTitle,
		exhibitionVenue: bodyData.exhibitionVenue,
		exhibitionDates: bodyData.exhibitionDates,
		createdAt: createdAt, // Include createdAt here
	};

	try {
		const exhibitionId = await insertDataQuery(newBodyData);

		if (exhibitionId) {
			const exhibitionDays = processExhibitionDates(bodyData.exhibitionDates);

			for (const day of exhibitionDays) {
				const dayInsertResult = await insertExhibitionDay(
					exhibitionId,
					day.dayTitle,
					day.exhibitionDate,
					createdAt
				);

				if (!dayInsertResult) {
					return Promise.reject(
						setRejectMessage(
							API_STATUS_CODE.INTERNAL_SERVER_ERROR,
							`Failed to insert ${day.dayTitle}`
						)
					);
				}
			}

			return Promise.resolve({
				status: 'success',
				message: 'Exhibition created successfully'
			});
		}

		return Promise.reject(
			setRejectMessage(
				API_STATUS_CODE.INTERNAL_SERVER_ERROR,
				"Insertion into exhibitions table failed"
			)
		);
	} catch (error) {
		// console.error("🚀 ~ addExhibitionsInfo ~ error:", error);
		return Promise.reject(
			setRejectMessage(
				API_STATUS_CODE.INTERNAL_SERVER_ERROR,
				"Operation failed"
			)
		);
	}
};

module.exports = {
	addExhibitionsInfo,
};
