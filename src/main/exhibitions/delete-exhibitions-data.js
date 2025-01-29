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


/**
 * This function will check whether the exhibitions data is available or not
 */
const checkIfExhibitionsExist = async (id) => {
    const _query = `
    SELECT
        id
    FROM
        exhibitions
    WHERE
        id = ?;
    `;

    try {
        const [result] = await pool.query(_query, id);
        if (result.length > 0) {
            return true;
        } return false;
    } catch (error) {
        // console.log("🚀 ~ deleteExhibitionsDataQuery ~ error:", error)
        return Promise.reject(error)
    }
}

const deleteExhibitionsDataQuery = async (id) => {
    const _query = `
    DELETE
    FROM
        exhibitions
    WHERE
        id = ?;
    `;

    try {
        const [result] = await pool.query(_query, id);
        if (result.affectedRows > 0) {
            return true;
        } return false;
    } catch (error) {
        // console.log("🚀 ~ deleteExhibitionsDataQuery ~ error:", error)
        return Promise.reject(error)
    }
}

/**
 * This function is used to delete exhibitions data from the database 
 */
const deleteExhibitionsData = async (bodyData) => {
    const lgKey = bodyData.lg;

    try {
        const isDataExist = await checkIfExhibitionsExist(bodyData.id);
        if (isDataExist) {
            const isDeleteData = await deleteExhibitionsDataQuery(bodyData.id);
            if (isDeleteData) {
                return Promise.resolve(
                    setServerResponse(
                        API_STATUS_CODE.OK,
                        'exhibitions_deleted_successfully',
                        lgKey,
                    )
                )
            }
        } else {
            return Promise.reject(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'exhibition_is_not_found',
                    lgKey,
                ))
        }
    } catch (error) {
        // console.log("🚀 ~ deleteExhibitionsData ~ error:", error)
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
    deleteExhibitionsData
}