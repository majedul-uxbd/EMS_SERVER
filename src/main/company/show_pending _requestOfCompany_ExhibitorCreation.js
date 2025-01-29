const _ = require("lodash");
const { pool } = require("../../../database/db");
const { setServerResponse } = require("../../common/set-server-response");
const { API_STATUS_CODE } = require("../../consts/error-status");

const getNumberOfPendingRowsQuery = async () => {
    const _query = `
    SELECT count(*) AS totalRows
    FROM companies
    WHERE current_status = 1;
    `;

    try {
        const [result] = await pool.query(_query);
        return Promise.resolve(result[0]);
    } catch (error) {
        return Promise.reject(error);
    }
};

const getPendingCompanyExhibitorDataQuery = async (paginationData) => {
    const _query = `
    SELECT
   *
    FROM
        companies
    WHERE
        current_status = 1
    LIMIT ?
    OFFSET ?;
    `;

    const values = [paginationData.itemsPerPage, paginationData.offset];

    try {
        const [result] = await pool.query(_query, values);
        return Promise.resolve(result);
    } catch (error) {
        return Promise.reject(error);
    }
};

/**
 * @description This function retrieves data for all pending company exhibitor creations.
 */
const getPendingCompanyExhibitorData = async (bodyData, paginationData) => {
    const lgKey = bodyData.lg;

    try {
        const totalRows = await getNumberOfPendingRowsQuery();
        const companyData = await getPendingCompanyExhibitorDataQuery(paginationData);

        const result = {
            metadata: {
                totalRows: totalRows,
            },
            data: companyData
        }
        return Promise.resolve(
            setServerResponse(
                API_STATUS_CODE.OK,
                'get_data_successfully',
                lgKey,
                result
            )
        );
    } catch (error) {
        return Promise.reject(
            setServerResponse(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                'Internal_server_error',
                lgKey
            )
        );
    }
};

module.exports = {
    getPendingCompanyExhibitorData
};
