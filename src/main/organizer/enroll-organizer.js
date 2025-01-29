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


const { API_STATUS_CODE } = require("../../consts/error-status");
const { pool } = require("../../../database/db");
const { setServerResponse } = require("../../common/set-server-response");


const checkIsOrganizerExist = async (id) => {
    const _query = `
    SELECT
        id,
        is_user_active
    FROM
        user
    WHERE
        id = ?;
`;

    try {
        const [result] = await pool.query(_query, id);
        if (result.length > 0) {
            if (result[0].is_user_active === 1) {
                return 1;
            }
            return 0;
        }
        return false;
    } catch (error) {
        return Promise.reject(error);
    }
}

const checkIsOrganizerAlreadyEnrolled = async (bodyData) => {
    const _query = `
    SELECT 
        id
    FROM
        exhibitions_has_organizer
    WHERE
        exhibition_id = ? AND
        organizer_id = ?;
`;

    const values = [
        bodyData.exhibitionId,
        bodyData.organizerId
    ];

    try {
        const [result] = await pool.query(_query, values);
        if (result.length > 0) {
            return true;
        }
        return false;
    } catch (error) {
        // console.log("🚀 ~ userLoginQuery ~ error:", error)
        return Promise.reject(error);
    }
};


const insertEnrollDataQuery = async (bodyData) => {

    const query = `
	INSERT INTO
        exhibitions_has_organizer
        (
            exhibition_id,
            organizer_id,
            created_at
        )
	VALUES (?, ?, ?);
	`;

    const values = [
        bodyData.exhibitionId,
        bodyData.organizerId,
        bodyData.createdAt
    ];

    try {
        const [result] = await pool.query(query, values);
        if (result.affectedRows > 0) {
            return true;
        }
        return false;
    } catch (error) {
        // console.log("🚀 ~ userLoginQuery ~ error:", error)
        return Promise.reject(error);
    }
};

/**
 * @description This function is used to enroll organizer in an exhibition
 */
const enrollOrganizer = async (bodyData) => {
    const lgKey = bodyData.lg;
    const createdAt = new Date();

    try {
        const isUserExist = await checkIsOrganizerExist(bodyData.organizerId);
        if (!isUserExist) {
            return Promise.reject(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'inactive_user_can_not_be_assigned_to_an_exhibition',
                    lgKey,
                )
            );
        }
        if (isUserExist === 0) {
            return Promise.reject(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'inactive_user_can_not_be_assigned_to_an_exhibition',
                    lgKey,
                )
            );
        }
        const isAlreadyEnrolled = await checkIsOrganizerAlreadyEnrolled(bodyData);
        if (isAlreadyEnrolled) {
            return Promise.reject(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'user_is_already_enrolled',
                    lgKey,
                )
            );
        }
        bodyData = { ...bodyData, createdAt: createdAt };

        const insertedData = await insertEnrollDataQuery(bodyData);
        if (insertedData) {
            return Promise.resolve(
                setServerResponse(
                    API_STATUS_CODE.OK,
                    'organizer_has_enrolled_in_the_exhibition_successfully',
                    lgKey,
                )
            )
        }
    } catch (error) {
        // console.log('🚀 ~ file: enroll-organizer.js:130 ~ enrollOrganizer ~ error:', error);
        return Promise.reject(
            setServerResponse(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                'internal_server_error',
                lgKey,
            )
        )
    }
}

module.exports = {
    enrollOrganizer
}