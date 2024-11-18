const _ = require("lodash");
const { pool } = require("../../../database/db");
const { setRejectMessage } = require("../../common/set-reject-message");
const { API_STATUS_CODE } = require("../../consts/error-status");

const getNumberOfPendingRowsQuery = async () => {
    const _query = `
    SELECT count(*) AS totalRows
    FROM companies
    WHERE current_status = 0;
    `;

    try {
        const [result] = await pool.query(_query);
        if (result.length > 0) {
            return Promise.resolve(result[0]);
        } else {
            return Promise.reject(
                setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'No pending companies found')
            );
        }
    } catch (error) {
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.INTERNAL_SERVER_ERROR, 'operation_failed')
        );
    }
};

const getPendingCompanyExhibitorDataQuery = async (paginationData) => {
    const _query = `
    SELECT
   *
    FROM
        companies
    WHERE
        current_status = 0
    LIMIT ?
    OFFSET ?;
    `;

    const values = [paginationData.itemsPerPage, paginationData.offset];

    try {
        const [result] = await pool.query(_query, values);
        return Promise.resolve(result);
    } catch (error) {
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.INTERNAL_SERVER_ERROR, 'operation_failed')
        );
    }
};

/**
 * @description This function retrieves data for all pending company exhibitor creations.
 */
const getPendingCompanyExhibitorData = async (paginationData) => {
    try {
        const totalRows = await getNumberOfPendingRowsQuery();
        const result = await getPendingCompanyExhibitorDataQuery(paginationData);

        return Promise.resolve({
            metadata: {
                totalRows: totalRows,
            },
            data: result
        });
    } catch (error) {
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.INTERNAL_SERVER_ERROR, 'Internal server error')
        );
    }
};

module.exports = {
    getPendingCompanyExhibitorData
};
