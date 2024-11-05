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
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Operation failed')
        )
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
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Operation failed')
        )
    }
}

/**
 * This function is used to delete exhibitions data from the database 
 */
const deleteExhibitionsData = async (bodyData) => {
    try {
        const isDataExist = await checkIfExhibitionsExist(bodyData.id);
        if (isDataExist) {
            const isDeleteData = await deleteExhibitionsDataQuery(bodyData.id);
            if (isDeleteData) {
                return Promise.resolve({
                    status: 'success',
                    message: 'Exhibitions deleted successfully'
                })
            }
        } else {
            return Promise.reject(
                setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Exhibitions data is not found')
            )
        }
    } catch (error) {
        // console.log("🚀 ~ deleteExhibitionsData ~ error:", error)
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.INTERNAL_SERVER_ERROR, 'Internal Server Error')
        );
    }
}

module.exports = {
    deleteExhibitionsData
}