const { pool } = require("../../../database/db");
const { setRejectMessage } = require("../../common/set-reject-message");
const { API_STATUS_CODE } = require("../../consts/error-status");

/**
 * @description This function updates the current_status of a company to 1 to mark the request as approved.
 * @param {number} companyId - The ID of the company to approve
 */
const approvePendingRequest = async (companyId) => {
    const updateQuery = `
    UPDATE companies
    SET current_status = 1
    WHERE id = ?;
    `;

    try {
        const [result] = await pool.query(updateQuery, [companyId]);

        if (result.affectedRows > 0) {
            return Promise.resolve();
        } else {
            return Promise.reject(
                setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Company not found or already approved')
            );
        }
    } catch (error) {
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.INTERNAL_SERVER_ERROR, 'operation_failed')
        );
    }
};

module.exports = {
    approvePendingRequest
};
