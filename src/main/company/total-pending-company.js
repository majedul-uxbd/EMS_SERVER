const { pool } = require("../../../database/db");
const { setServerResponse } = require("../../common/set-server-response");
const { API_STATUS_CODE } = require("../../consts/error-status");

/**
 * Get count of pending requests from companies table
 */
const getPendingRequestsCount = async (bodyData) => {
    const lgKey = bodyData.lg;
    try {
        const query = `
            SELECT
                COUNT(*) AS pendingCount
            FROM
                companies
            WHERE
                current_status = ${1} AND is_active = ${0}
        `;

        const [result] = await pool.query(query);
        const totalPendingRequests = result[0].pendingCount;

        // Return the count with additional metadata if needed
        return Promise.resolve(
            setServerResponse(
                API_STATUS_CODE.OK,
                'get_data_successfully',
                lgKey,
                totalPendingRequests
            )
        )
    } catch (error) {
        // console.error("Error getting pending requests count:", error);
        return Promise.reject(
            setServerResponse(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                'internal_server_error',
                lgKey
            )
        );
    }
};

module.exports = {
    getPendingRequestsCount,

};