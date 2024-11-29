const { pool } = require("../../../database/db");
const { setRejectMessage } = require("../../common/set-reject-message");
const { API_STATUS_CODE } = require("../../consts/error-status");

/**
 * Get count of pending requests from companies table
 * @returns {Promise<Object>} Count of pending requests
 */
const getPendingRequestsCount = async () => {
    try {
        const query = `
            SELECT COUNT(*) as pendingCount
            FROM companies
            WHERE current_status = 1
        `;

        const [result] = await pool.query(query);

        // Return the count with additional metadata if needed
        return Promise.resolve({
            totalPendingRequests: result[0].pendingCount,
            lastChecked: new Date().toISOString()
        });

    } catch (error) {
        console.error("Error getting pending requests count:", error);
        return Promise.reject(
            setRejectMessage(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                'Failed to fetch pending requests count'
            )
        );
    }
};

module.exports = {
    getPendingRequestsCount,

};