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

const { pool } = require('../../../database/db');
const { setRejectMessage } = require('../../common/set-reject-message');
const { API_STATUS_CODE } = require('../../consts/error-status');


const insertDataQuery = async (bodyData) => {
    const query = `
    INSERT INTO
        exhibitions
        (
            exhibitions_title,
            exhibition_start_date,
            exhibition_end_date,
            exhibition_venue,
            created_at
        )
    VALUES (?, ?, ?, ?, ?);
    `;

    const values = [
        bodyData.exhibitionTitle,
        bodyData.exhibitionStartDate,
        bodyData.exhibitionEndDate,
        bodyData.exhibitionVenue,
        bodyData.createdAt
    ];

    try {
        const [result] = await pool.query(query, values);
        console.log("🚀 ~ insertDataQuery ~ result:", result);

        if (result.affectedRows === 1) {
            return true;
        }
        return false;
    } catch (error) {
        return Promise.reject('operation-failed');
    }
}


const addExhibitionsInfo = async (bodyData) => {

    const epochTimestamp = Math.floor(new Date().getTime() / 1000);
    const newBodyData = {
        exhibitionTitle: bodyData.exhibitionTitle,
        exhibitionStartDate: bodyData.exhibitionStartDate,
        exhibitionEndDate: bodyData.exhibitionEndDate,
        exhibitionVenue: bodyData.exhibitionVenue,
        createdAt: epochTimestamp
    };
    try {
        const insertResult = await insertDataQuery(newBodyData);
        if (insertResult) {
            return Promise.resolve('Data inserted successfully');
        }
    } catch (error) {
        // console.log("🚀 ~ addExhibitionsInfo ~ error:", error)
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.INTERNAL_SERVER_ERROR, 'Operation failed')
        )
    }
}

module.exports = {
    addExhibitionsInfo
}