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

const { pool } = require("../../database/db");
const { API_STATUS_CODE } = require("../consts/error-status");

const getUserData = async (userData) => {
    // console.log("🚀 ~ getUserData ~ userData:", userData)
    const tableName = [];
    if (userData.role === 'visitor') {
        tableName.push('visitors');
    }
    else {
        tableName.push('user');
    }

    const _query = `
        SELECT
            id,
            email
        FROM
            ${tableName}
        WHERE
            id = ? AND 
            email = ? AND 
            is_user_active = ${1};
    `;

    const values = [
        userData.id,
        userData.email
    ]

    try {
        const [result] = await pool.query(_query, values);
        if (result.length > 0) {
            return true;
        }
        return false;
    } catch (error) {
        // console.log("🚀 ~ getUserData ~ error:", error)
        return res.status(API_STATUS_CODE.BAD_REQUEST).send({
            status: "failed",
            message: "Operation failed",
        });
    }
}


const checkUserIdValidity = async (req, res, next) => {
    const userData = req.auth;

    try {
        const isUserValid = await getUserData(userData);
        if (!isUserValid) {
            return res.status(API_STATUS_CODE.BAD_REQUEST).send({
                status: "failed",
                message: "Invalid user",
            });
        }
        next();
    } catch (error) {
        return res.status(API_STATUS_CODE.INTERNAL_SERVER_ERROR).send({
            status: "failed",
            message: "Internal server error",
        });
    }
}


module.exports = {
    checkUserIdValidity
}