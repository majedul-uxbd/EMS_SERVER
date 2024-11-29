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


const checkExhibitionIsExistOrNotQuery = async (id) => {

    const _query = `
    SELECT
        id
    FROM
        exhibitions
    WHERE
        id = ?;
    `;

    try {
        const [result] = await pool.query(_query, id);
        if (result.length > 0) {
            return true;
        }
        return false;
    } catch (error) {
        console.log("🚀 ~ getUserData ~ error:", error)

    }
}


const insertDataQuery = async (bodyData) => {
    const query = `
    INSERT INTO
        exhibitions
        (
            id,
            exhibitions_title,
            exhibition_venue,
            exhibition_dates,
            created_at
        )
    VALUES (?, ?, ?, ?, ?);
    `;

    const values = [
        bodyData.id,
        bodyData.exhibitionTitle,
        bodyData.exhibitionVenue,
        JSON.stringify(bodyData.exhibitionDates),
        bodyData.createdAt,
    ];

    try {
        const [result] = await pool.query(query, values);
        if (result.affectedRows === 1) {
            return true;
        } return false;
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


const updateExhibitionData = async (bodyData) => {
    const updatedAt = new Date();
    bodyData = { ...bodyData, updatedAt: updatedAt }
    try {
        const isExist = await checkExhibitionIsExistOrNotQuery(bodyData.id);
        if (isExist) {
            const isInsert = await insertDataQuery(newBodyData);
            if (isInsert) {
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
        } else {
            setRejectMessage(
                API_STATUS_CODE.BAD_REQUEST,
                "Exhibition is not found"
            )
        }
    } catch (error) {
        console.log('🚀 ~ file: update-exhibition-data.js:101 ~ updateExhibitionData ~ error:', error);

    }
}

module.exports = {
    updateExhibitionData
}