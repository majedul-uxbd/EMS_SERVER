/**
 * @author Md. Majedul Islam <https://github.com/majedul-uxbd>
 * Software Engineer,
 * Ultra-X BD Ltd.
 *
 * @copyright All right reserved Majedul All right reserved Md. Majedul Islam
 *
 * @description
 *
 */
const _ = require('lodash');
const { pool } = require('../../../database/db');
const { API_STATUS_CODE } = require('../../consts/error-status');
const { setRejectMessage } = require('../../common/set-reject-message');


const getVisitorDataQuery = async (id) => {
    const query = `
	SELECT
		f_name,
        l_name,
        email,
        company,
        contact_no,
        position,
        role,
        profile_img
	FROM
		visitors
	WHERE
		id = ?
    AND
        is_user_active = ${1};
	`;
    const values = [id];

    try {
        const [result] = await pool.query(query, values);
        if (result.length > 0) {
            return Promise.resolve(result);
        }
    } catch (error) {
        // console.log('🚀 ~ userLoginQuery ~ error:', error);
        return Promise.reject(
            setRejectMessage(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                'operation_failed'
            )
        );
    }
};

const getVisitorData = async (visitor) => {

    try {
        const userInfo = await getVisitorDataQuery(visitor.id);
        return Promise.resolve({
            message: 'Visitor data fetched successfully',
            user: userInfo
        });
    } catch (error) {
        // console.log("🚀 ~ userLogin ~ error:", error)
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.INTERNAL_SERVER_ERROR, 'Internal Server Error')
        );
    }
};
module.exports = {
    getVisitorData,
};
