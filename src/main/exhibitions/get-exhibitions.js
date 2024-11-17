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


const getUserEnrollInformationQuery = async (authData) => {
    let query = '';

    const query1 = `
        SELECT
            ex.id,
            ex.exhibition_dates,
            ehv.visitor_id
        FROM
            exhibitions AS ex
        LEFT JOIN
            exhibitions_has_visitor AS ehv
        ON
            ex.id = ehv.exhibition_id
        WHERE
            ehv.visitor_id = ?;
    `;

    const query2 = `
        SELECT
            ex.id,
            ex.exhibition_dates,
            u.id
        FROM
            exhibitions AS ex
        LEFT JOIN
            exhibitions_has_companies AS ehc
        ON
            ex.id = ehc.exhibition_id
        LEFT JOIN user AS u
        ON
            ehc.company_id = u.companies_id
        WHERE
            u.id = ?;
    `;

    if (authData.role === 'visitor') {
        query = query1;
    } else {
        query = query2;
    }
    try {
        const [result] = await pool.query(query, authData.id);
        return Promise.resolve(result);
    } catch (error) {
        // console.log('🚀 ~ file: get-exhibitions.js:53 ~ getUserEnrollInformationQuery ~ error:', error);
        return Promise.reject(error);
    }
}

const getExhibitionDataQuery = async (paginationData) => {
    const _query = `
    SELECT 
        id, 
        exhibitions_title,
        exhibition_dates,
        exhibition_venue,
        created_at
    FROM
        exhibitions;
    `;

    try {
        const [result] = await pool.query(_query);
        return Promise.resolve(result);
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


/**
 * @description This function is used to get all exhibitions information 
 */
const getExhibition = async (authData) => {
    const today = new Date();
    try {
        const enrollInfo = await getUserEnrollInformationQuery(authData);
        let enrollData = enrollInfo.filter(enroll => {
            const dates = JSON.parse(enroll.exhibition_dates);

            // Check if any date matches today or if the first date is in the future
            const hasMatchingOrUpcomingDate = dates.some(date => {
                const exhibitionDate = new Date(date);
                return exhibitionDate >= today;
            });
            return hasMatchingOrUpcomingDate;
        });

        if (enrollData.length <= 0) {
            enrollData = []
        }

        const exhibitionInfo = await getExhibitionDataQuery();

        const exhibitions = exhibitionInfo.filter(exhibition => {
            const dates = JSON.parse(exhibition.exhibition_dates);

            // Check if any date matches today or if the first date is in the future
            const hasMatchingOrUpcomingDate = dates.some(date => {
                const exhibitionDate = new Date(date);
                return exhibitionDate >= today;
            });
            return hasMatchingOrUpcomingDate;
        });

        if (exhibitions.length > 0) {
            return Promise.resolve({
                exhibitionData: exhibitions,
                enrollData: enrollData,
            })
        }
    } catch (error) {
        // console.log("🚀 ~ userLogin ~ error:", error)
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.INTERNAL_SERVER_ERROR, 'Internal Server Error')
        );
    }
};


module.exports = {
    getExhibition
}