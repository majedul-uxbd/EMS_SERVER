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


const checkIfDocumentExist = async (id) => {
    const _query = `
    SELECT
        id
    FROM
        documents
    WHERE
        id = ?;
    `;
    try {
        const [result] = await pool.query(_query, id);
        if (result.length > 0) {
            return true;
        }
        return false;
    } catch (error) {
        return Promise.reject(error);
    }
}


const deleteDocumentDataQuery = async (id) => {
    const _query = `
    DELETE
    FROM
        documents
    WHERE
        id = ?;
    `;
    try {
        const [result] = await pool.query(_query, id);
        if (result.affectedRows > 0) {
            return true;
        }
        return false;
    } catch (error) {
        return Promise.reject(error);
    }
}

/**
 * @description This function is used to delete project document
 */
const deleteDocumentData = async (bodyData) => {
    try {
        const isDocumentExist = await checkIfDocumentExist(bodyData.id);
        if (isDocumentExist) {
            const isDeleteData = await deleteDocumentDataQuery(bodyData.id);
            if (isDeleteData) {
                return Promise.resolve({
                    status: 'success',
                    message: 'Document deleted successfully'
                })
            } else {
                return Promise.reject(
                    setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Failed to delete document')
                )
            }
        } return Promise.reject(
            setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Document is not found')
        )
    } catch (error) {
        // console.log("🚀 ~ deleteDocumentData ~ error:", error)
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.INTERNAL_SERVER_ERROR, 'Internal Server Error')
        )
    }
}

module.exports = {
    deleteDocumentData
}