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
    const lgKey = bodyData.lg;
    if (!bodyData.id) {
        return Promise.reject(
            setServerResponse(
                API_STATUS_CODE.BAD_REQUEST,
                'document_id_is_required',
                lgKey
            )
        );
    }
    try {
        const isDocumentExist = await checkIfDocumentExist(bodyData.id);
        if (isDocumentExist) {
            const isDeleteData = await deleteDocumentDataQuery(bodyData.id);
            if (isDeleteData) {
                return Promise.resolve(
                    setServerResponse(
                        API_STATUS_CODE.OK,
                        'document_deleted_successfully',
                        lgKey,
                    )
                )
            } else {
                return Promise.reject(
                    setServerResponse(
                        API_STATUS_CODE.BAD_REQUEST,
                        'failed_to_delete_document',
                        lgKey,
                    )
                )
            }
        } return Promise.reject(
            setServerResponse(
                API_STATUS_CODE.BAD_REQUEST,
                'document_is_not_found',
                lgKey,
            )
        )
    } catch (error) {
        // console.log("🚀 ~ deleteDocumentData ~ error:", error)
        return Promise.reject(
            setServerResponse(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                'internal_server_error',
                lgKey,
            )
        )
    }
}

module.exports = {
    deleteDocumentData
}