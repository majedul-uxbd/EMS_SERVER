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
const { setServerResponse } = require("../../common/set-server-response");
const { API_STATUS_CODE } = require("../../consts/error-status");


const approveOrRejectRequestQuery = async (authData, bodyData) => {
    const _query = `
    UPDATE
        approved_document
    SET
        is_approved = ?,
        approve_or_disapprove_by = ?
    WHERE
        id = ? AND
        project_id = ?;
    `;



    try {
        if (bodyData.isApproved === true) {
            const _values = [
                '1',
                authData.id,
                bodyData.id,
                bodyData.projectId
            ];
            const [result] = await pool.query(_query, _values);
            return 'approved';
        }
        else {
            const _values = [
                '0',
                authData.id,
                bodyData.id,
                bodyData.projectId
            ];
            const [result] = await pool.query(_query, _values);
            return 'rejected';
        }
    } catch (error) {
        return Promise.reject(error);
    }
}

/**
 * @description This function is used to approve or reject visitor request
 */
const approveOrRejectRequest = async (authData, bodyData) => {
    const lgKey = bodyData.lg;

    try {
        const isApproved = await approveOrRejectRequestQuery(authData, bodyData);
        return Promise.resolve(
            setServerResponse(
                API_STATUS_CODE.OK,
                `${isApproved}`,
                lgKey,
            )
        )
    } catch (error) {
        return Promise.reject(
            setServerResponse(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                'internal_server_error',
                lgKey,
            )
        );
    }
}

module.exports = {
    approveOrRejectRequest
}