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


const getIsCompanyActiveOrNotQuery = async (bodyData) => {
    const _query = `
    SELECT
        company.is_active
    FROM
        companies AS company
    LEFT JOIN
        user
    ON
        company.id = user.companies_id
    WHERE
        user.id = ?;
    `;

    try {
        const [result] = await pool.query(_query, bodyData.id);
        if (result[0].is_active === 1) {
            return true;
        }
        return false;
    } catch (error) {
        return Promise.reject(error);
    }
}


const activeUserQuery = async (bodyData) => {
    const _query = `
    UPDATE
        user
    SET
        is_user_active = ${1}
    WHERE
        id = ?;
    `;

    try {
        const [result] = await pool.query(_query, bodyData.id);
        if (result.affectedRows === 1) {
            return true;
        }
        return false;
    } catch (error) {
        return Promise.reject(error);
    }
};

/**
 * @description This function is used to active user
 */
const activeUser = async (bodyData) => {
    try {
        const isCompanyActive = await getIsCompanyActiveOrNotQuery(bodyData);
        if (isCompanyActive) {
            const activeUser = await activeUserQuery(bodyData);
            if (activeUser) {
                return Promise.resolve({
                    status: 'success',
                    message: 'User is activated successfully'
                })
            } else {
                return Promise.reject(
                    setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Failed to active user')
                );
            }
        } else {
            return Promise.reject(
                setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'User company is not active')
            );
        }
    } catch (error) {
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.INTERNAL_SERVER_ERROR, 'Internal Server Error')
        );
    }
}

module.exports = {
    activeUser
}