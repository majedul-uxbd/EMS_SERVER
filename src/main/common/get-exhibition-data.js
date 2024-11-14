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

const exhibitionDataForOrganizer = async () => {
    const _query = `
        SELECT
            id,
            exhibitions_title,
            exhibition_dates,
            exhibition_venue,
            created_at
        FROM
            exhibitions
    `;

    try {
        const [result] = await pool.query(_query);
        return result;
    } catch (error) {
        return Promise.reject(error);
    }
}


const exhibitionDataForExhibitor = async (authData) => {
    const _query = `
        SELECT
            ex.id,
            ex.exhibitions_title,
            ex.exhibition_dates,
            ex.exhibition_venue,
            ex.created_at
        FROM
            exhibitions as ex
        LEFT JOIN
            exhibitions_has_companies AS ehc
        ON ex.id=ehc.exhibition_id
        LEFT JOIN user AS u
        ON
            ehc.company_id = u.companies_id
        WHERE
            u.id = ? AND 
            u.role = ?;
    `;
    const _values = [
        authData.id,
        authData.role
    ]

    try {
        const [result] = await pool.query(_query, _values);
        return result;
    } catch (error) {
        return Promise.reject(error);
    }
}


const exhibitionDataForVisitor = async (authData) => {
    const _query = `
    SELECT
        ex.id,
        ex.exhibitions_title,
        ex.exhibition_dates,
        ex.exhibition_venue,
        ex.created_at
    FROM
        exhibitions as ex
    LEFT JOIN
        exhibitions_has_visitor AS ehv
    ON ex.id=ehv.exhibition_id
    LEFT JOIN visitors AS v
    ON
        ehv.visitor_id = v.id
    WHERE
        v.id = ? AND 
        v.role = ?;
`;
    const _values = [
        authData.id,
        authData.role
    ]

    try {
        const [result] = await pool.query(_query, _values);
        return result;
    } catch (error) {
        return Promise.reject(error);
    }
}

/**
 * @description 
 */
const getExhibitionDataForUsers = async (authData) => {
    const userRole = authData.role;
    const today = new Date();

    try {
        if (userRole === 'organizer') {
            const exhibitionData = await exhibitionDataForOrganizer();

            const exhibitions = exhibitionData.filter(exhibition => {
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
                    data: exhibitions
                })
            } else {
                return Promise.reject(
                    setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'No exhibitions found')
                )
            }
        }
        else if (userRole === 'exhibitor' || userRole === 'exhibitor_admin') {
            const exhibitions = await exhibitionDataForExhibitor(authData);
            if (exhibitions.length > 0) {
                return Promise.resolve({
                    data: exhibitions
                })
            } else {
                return Promise.reject(
                    setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'No exhibitions found')
                )
            }

        }
        else if (userRole === 'visitor') {
            const exhibitions = await exhibitionDataForVisitor(authData);
            if (exhibitions.length > 0) {
                return Promise.resolve({
                    data: exhibitions
                })
            } else {
                return Promise.reject(
                    setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'No exhibitions found')
                )
            }
        }
        else {
            return Promise.reject(
                setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Invalid User Role')
            );
        }
    } catch (error) {
        // console.log('🚀 ~ file: get-exhibition-data.js:94 ~ getExhibitionData ~ error:', error);
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Internal Server Error')
        );
    }
};

module.exports = {
    getExhibitionDataForUsers
};