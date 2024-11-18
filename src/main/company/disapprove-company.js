const { pool } = require("../../../database/db");
const { setRejectMessage } = require("../../common/set-reject-message");
const { API_STATUS_CODE } = require("../../consts/error-status");

/**
 * @description This function deletes a company from the `companies` table and its associated users from the `user` table.
 */
const disapprovePendingRequest = async (companyId) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Step 1: Delete users associated with the company
        const deleteUserQuery = `DELETE FROM user WHERE companies_id = ?;`;
        await connection.query(deleteUserQuery, [companyId]);

        // Step 2: Delete the company
        const deleteCompanyQuery = `DELETE FROM companies WHERE id = ?;`;
        const [result] = await connection.query(deleteCompanyQuery, [companyId]);

        if (result.affectedRows === 0) {
            throw setRejectMessage(API_STATUS_CODE.NOT_FOUND, 'Company not found');
        }

        await connection.commit();
        return Promise.resolve();
    } catch (error) {
        await connection.rollback();
        if (error.statusCode) throw error;
        throw setRejectMessage(API_STATUS_CODE.INTERNAL_SERVER_ERROR, 'Internal server error');
    } finally {
        connection.release();
    }
};

module.exports = {
    disapprovePendingRequest
};
