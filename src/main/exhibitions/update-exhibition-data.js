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


const checkExhibitionIsExistOrNotQuery = async (id) => {
    const _query = `
    SELECT
        *
    FROM
        exhibitions
    WHERE
        id = ?;
    `;

    try {
        const [result] = await pool.query(_query, id);
        const today = new Date();
        if (result.length > 0) {
            const dates = JSON.parse(result[0].exhibition_dates);
            // Check if 1st date is after today
            const normalizedToday = new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate()
            );
            const isUpcomingDate = new Date(dates[0]) > normalizedToday;
            if (isUpcomingDate === true) {
                return true;
            } else {
                return "previous"
            }
        }
        return false;
    } catch (error) {
        // console.log("🚀 ~ getUserData ~ error:", error)
        return Promise.reject(error);
    }
}


const deleteExhibitionDaysQuery = async (id) => {
    const _query = `
    DELETE
    FROM
        exhibition_days
    WHERE
        exhibitions_id = ?;
    `;
    try {
        const [result] = await pool.query(_query, id);
        if (result.affectedRows >= 0) {
            return true;
        }
        return false;
    } catch (error) {
        return Promise.reject(error);
    }
}

const getExhibitionNameQuery = async () => {
    const query = `
    SELECT
        id,
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

const updateDataQuery = async (bodyData) => {
    const query = `
    UPDATE
        exhibitions
    SET
        exhibitions_title = ?,
        exhibition_venue = ?,
        exhibition_dates = ?,
        updated_at = ?
    WHERE
        id = ?;
    `;

    const values = [
        bodyData.exhibitionTitle,
        bodyData.exhibitionVenue,
        JSON.stringify(bodyData.exhibitionDates),
        bodyData.updatedAt,
        bodyData.id,
    ];
    try {
        const [result] = await pool.query(query, values);
        if (result.affectedRows > 0) {
            return true;
        }
        return false;
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
        if (result.affectedRows > 0) {
            return true;
        } else {
            return false;
        }
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
 * @description This function will update the exhibition data 
 */
const updateExhibitionData = async (bodyData) => {
    const lgKey = bodyData.lg;
    let isMatched = false;
    const createdAt = new Date();
    const updatedAt = new Date();
    bodyData = { ...bodyData, updatedAt: updatedAt }

    try {
        const isExist = await checkExhibitionIsExistOrNotQuery(bodyData.id);
        if (isExist) {
            const exhibitionName = await getExhibitionNameQuery();
            if (exhibitionName !== null) {
                for (const exhibition of exhibitionName) {
                    if (exhibition.id === bodyData.id) {
                        continue;
                    }
                    const result = compareStrings(bodyData.exhibitionTitle, exhibition.exhibitions_title);
                    if (result) {
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
            const isDeleted = await deleteExhibitionDaysQuery(bodyData.id);
            const inserted = await updateDataQuery(bodyData);

            if (inserted) {
                const exhibitionDays = processExhibitionDates(bodyData.exhibitionDates);

                for (const day of exhibitionDays) {
                    const dayInsertResult = await insertExhibitionDay(
                        bodyData.id,
                        day.dayTitle,
                        day.exhibitionDate,
                        createdAt
                    );



                    if (!dayInsertResult) {
                        return Promise.reject(
                            setServerResponse(
                                API_STATUS_CODE.BAD_REQUEST,
                                `failed_to_create_exhibition_days`,
                                lgKey
                            )
                        );
                    }
                }

                return Promise.resolve(
                    setServerResponse(
                        API_STATUS_CODE.OK,
                        'exhibition_updated_successfully',
                        lgKey
                    )
                );
            } else {
                return Promise.reject(
                    setServerResponse(
                        API_STATUS_CODE.BAD_REQUEST,
                        `failed_to_update_exhibition`,
                        lgKey
                    )
                );
            }
        }
        if (isExist === "previous") {
            return Promise.reject(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'previous_exhibition_can_not_update',
                    lgKey
                )
            );
        }
        if (isExist === false) {
            return Promise.reject(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'exhibition_is_not_found',
                    lgKey
                )
            );
        }
    } catch (error) {
        // console.warn('🚀 ~ file: update-exhibition-data.js:275 ~ updateExhibitionData ~ error:', error);
        return Promise.reject(
            setServerResponse(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                'internal_server_error',
                lgKey,
            )
        );
    }
}

module.exports = {
    updateExhibitionData
}