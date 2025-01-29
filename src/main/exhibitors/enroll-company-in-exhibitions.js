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


const getCompanyIdQuery = async (authData) => {
    const _query = `
        SELECT
            companies_id
        FROM
            user
        WHERE
            id = ?;
        `;
    try {
        const [result] = await pool.query(_query, authData.id);
        return result[0].companies_id;
    } catch (error) {
        return Promise.reject(error);
    }
}


const checkExhibitionIsValid = async (bodyData) => {
    const _query = `
        SELECT
            id
        FROM
            exhibitions
        WHERE
            id = ?;
        `;
    try {
        const [result] = await pool.query(_query, bodyData.exhibitionId);
        if (result.length > 0) {
            return true;
        }
        return false;
    } catch (error) {
        return Promise.reject(error);
    }
}


const checkUserCompanyIsValid = async (bodyData) => {

    const _query = `
        SELECT
            id
        FROM
            companies
        WHERE
            id = ? AND
            is_active = ${1}
    `;

    try {
        const [result] = await pool.query(_query, bodyData.companyId);
        if (result.length > 0) {
            return true;
        }
        return false;
    } catch (error) {
        return Promise.reject(error);
    }
};


const checkIfCompanyAlreadyEnrolled = async (bodyData) => {

    const _query = `
        SELECT
            id
        FROM
            exhibitions_has_companies
        WHERE
            exhibition_id  = ? AND
            company_id  = ?;
    `;

    const _values = [
        bodyData.exhibitionId,
        bodyData.companyId
    ]

    try {
        const [result] = await pool.query(_query, _values);
        if (result.length > 0) {
            return true;
        }
        return false;
    } catch (error) {
        return Promise.reject(error);
    }
};


const insertEnrollData = async (authData, bodyData) => {
    const _query = `
        INSERT INTO
            exhibitions_has_companies
            (
                exhibition_id,
                company_id,
                enrolled_by,
                created_at
            )
        VALUES ( ?, ?, ?, UTC_TIMESTAMP());
    `;

    const _values = [
        bodyData.exhibitionId,
        bodyData.companyId,
        authData.id
    ]

    try {
        const [result] = await pool.query(_query, _values);
        if (result.affectedRows > 0) {
            return true;
        }
        return false;
    } catch (error) {
        return Promise.reject(error);
    }
};


/**
 * @description This function is used to enroll a company in an exhibition
 */
const enrollCompanyInExhibition = async (authData, bodyData) => {
    const lgKey = bodyData.lg;

    try {
        const companyId = await getCompanyIdQuery(authData);
        bodyData = { ...bodyData, companyId: companyId };

        const isValidCompany = await checkUserCompanyIsValid(bodyData);
        if (!isValidCompany) {
            return Promise.reject(
                setServerResponse(
                    API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                    'invalid_company',
                    lgKey,
                )
            );
        }
        const isValidExhibition = await checkExhibitionIsValid(bodyData);
        if (!isValidExhibition) {
            return Promise.reject(
                setServerResponse(
                    API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                    'exhibition_is_not_found',
                    lgKey,
                )
            );
        }
        const isAlreadyEnrolled = await checkIfCompanyAlreadyEnrolled(bodyData);
        if (isAlreadyEnrolled) {
            return Promise.reject(
                setServerResponse(
                    API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                    'the_company_has_already_enrolled',
                    lgKey,
                )
            );
        }
        const insertData = await insertEnrollData(authData, bodyData);
        if (insertData) {
            return Promise.resolve(
                setServerResponse(
                    API_STATUS_CODE.OK,
                    'company_enrolled_successfully',
                    lgKey,
                )
            );
        }

    } catch (error) {
        // console.log('🚀 ~ file: enroll-company-in-exhibitions.js:127 ~ error:', error);
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
    enrollCompanyInExhibition
}