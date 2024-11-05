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
            return 'Approved';
        }
        else {
            const _values = [
                '0',
                authData.id,
                bodyData.id,
                bodyData.projectId
            ];
            const [result] = await pool.query(_query, _values);
            return 'Rejected';
        }
    } catch (error) {
        return Promise.reject(error);
    }
}

/**
 * @description This function is used to approve or reject visitor request
 */
const approveOrRejectRequest = async (authData, bodyData) => {
    try {
        const isApproved = await approveOrRejectRequestQuery(authData, bodyData);
        return Promise.resolve({
            status: 'success',
            message: isApproved
        })
    } catch (error) {
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.INTERNAL_SERVER_ERROR, 'Internal Server Error')
        );
    }
}

module.exports = {
    approveOrRejectRequest
}