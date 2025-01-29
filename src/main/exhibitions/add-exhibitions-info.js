const { pool } = require("../../../database/db");
const { setServerResponse } = require("../../common/set-server-response");
const { API_STATUS_CODE } = require("../../consts/error-status");

const getExhibitionNameQuery = async () => {
	const query = `
    SELECT
		exhibitions_title
	FROM
		exhibitions;
    `;

	try {
		const [result] = await pool.query(query);
		if (result.length > 0) {
			return result;
		} else {
			return null;
		}
	} catch (error) {
		// console.log('🚀 ~ file: add-exhibitions-info.js:23 ~ getExhibitionNameQuery ~ error:', error);
		return Promise.reject(error);
	}
};


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


/**
 * @param {string} str1 
 * @param {string} str2 
 * @param {boolean} caseInsensitive 
 * @description This function will check if the str1 and str2 are the same string or not.
 */
const compareStrings = (str1, str2, caseInsensitive = true) => {
	const splitStr1 = str1.trim().split(/\s+/);
	const splitStr2 = str2.trim().split(/\s+/);

	if (splitStr1.length === splitStr2.length) {
		for (let i = 0; i < splitStr1.length; i++) {
			if (caseInsensitive) {
				if (splitStr1[i].toLowerCase() !== splitStr2[i].toLowerCase()) {
					return false;
				}
			} else {
				if (splitStr1[i] !== splitStr2[i]) {
					return false;
				}
			}
		}
		return true;
	}
	return false;
}


/**
 * @description This function is used to create exhibition and exhibition days 
 */
const addExhibitionsInfo = async (bodyData) => {
	const lgKey = bodyData.lg;
	let isMatched = false;
	const createdAt = new Date();

	const newBodyData = {
		exhibitionTitle: bodyData.exhibitionTitle,
		exhibitionVenue: bodyData.exhibitionVenue,
		exhibitionDates: bodyData.exhibitionDates,
		createdAt: createdAt, // Include createdAt here
	};

	try {
		const exhibitionName = await getExhibitionNameQuery();
		if (exhibitionName !== null) {
			for (const exhibition of exhibitionName) {
				const result = compareStrings(newBodyData.exhibitionTitle, exhibition.exhibitions_title);
				if (result) {
					// console.log(`Match found: ${newBodyData.exhibitionTitle} matches with ${exhibition.exhibitions_title}`);
					isMatched = true;
					break;
				}
			}
			if (isMatched === true) {
				return Promise.reject(
					setServerResponse(
						API_STATUS_CODE.BAD_REQUEST,
						`exhibition_title_has_already_exists`,
						lgKey,
					)
				);
			}
		}

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
						setServerResponse(
							API_STATUS_CODE.BAD_REQUEST,
							`failed_to_insert_data`,
							lgKey,
						)
					);
				}
			}
			return Promise.resolve(
				setServerResponse(
					API_STATUS_CODE.OK,
					'exhibition_created_successfully',
					lgKey,
				)
			);
		}
		return Promise.reject(
			setServerResponse(
				API_STATUS_CODE.BAD_REQUEST,
				'insertion_into_exhibitions_table_failed',
				lgKey,
			)
		);
	} catch (error) {
		// console.error("🚀 ~ addExhibitionsInfo ~ error:", error);
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
	addExhibitionsInfo,
};
