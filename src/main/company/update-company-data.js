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


const checkDuplicateName = async () => {
    const _query = `
    SELECT 
        id,
        name
    FROM
        companies;
`;

    try {
        const [result] = await pool.query(_query);
        if (result.length > 0) {
            return result;
        }
        return false;
    } catch (error) {
        // console.log("🚀 ~ userLoginQuery ~ error:", error)
        return Promise.reject(error)
    }
};

const checkIsCompanyExist = async (bodyData) => {
    const _query = `
    SELECT 
        id
    FROM
        companies
    WHERE
        id = ?;
`;

    try {
        const [result] = await pool.query(_query, bodyData.id);
        if (result.length > 0) {
            return true;
        }
        return false;
    } catch (error) {
        // console.log("🚀 ~ userLoginQuery ~ error:", error)
        return Promise.reject(error)
    }
};

const updateCompanyInfoQuery = (bodyData) => {
    let _query = `UPDATE companies SET `;
    const _values = [];

    if (bodyData.companyName) {
        _query += 'name = ? ';
        _values.push(bodyData.companyName);
    }

    if (bodyData.website_link) {
        if (_values.length > 0) {
            _query += ', ';
        }
        _query += 'website_link = ? ';
        _values.push(bodyData.website_link);
    }

    if (bodyData.address) {
        if (_values.length > 0) {
            _query += ', ';
        }
        _query += 'address = ? ';
        _values.push(bodyData.address);
    }

    if (bodyData.email) {
        if (_values.length > 0) {
            _query += ', ';
        }
        _query += 'email = ? ';
        _values.push(bodyData.email);
    }

    if (_values.length > 0) {
        _query += ', updated_at = ? ';
        _values.push(bodyData.updated_at);
    }

    _query += 'WHERE id  =?';
    _values.push(bodyData.id);

    return [_query, _values];
};

/**
 * @param {string} str1 
 * @param {string} str2 
 * @param {boolean} caseInsensitive 
 * @description This function will check if the str1 and str2 are the same string or not.
 */
const compareStrings = (str1, str2, caseInsensitive = true) => {
    const splitStr1 = str1.trim().split(/\s+/);
    const splitStr2 = str2.trim().split(/\s+/);

    if (splitStr1.length === splitStr2.length) {
        for (let i = 0; i < splitStr1.length; i++) {
            if (caseInsensitive) {
                if (splitStr1[i].toLowerCase() !== splitStr2[i].toLowerCase()) {
                    return false;
                }
            } else {
                if (splitStr1[i] !== splitStr2[i]) {
                    return false;
                }
            }
        }
        return true;
    }
    return false;
}


/**
 * @description This function will update company account information
 */
const updateCompanyInfo = async (bodyData) => {
    const lgKey = bodyData.lg;
    const createdAt = new Date();
    let isMatched = false;

    bodyData = { ...bodyData, updated_at: createdAt }
    try {
        const isExist = await checkIsCompanyExist(bodyData);
        if (!isExist) {
            return Promise.reject(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'company_not_found',
                    lgKey,
                )
            );
        }
        const companyName = await checkDuplicateName();
        for (const company of companyName) {
            if (company.id === bodyData.id) {
                continue;
            }
            const result = compareStrings(bodyData.companyName, company.name);
            if (result) {
                // console.log(`Match found: ${companyData.companyName} matches with ${company.name}`);
                isMatched = true;
                break;
            }
        }
        if (isMatched === true) {
            return Promise.reject(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'company_name_has_already_exist',
                    lgKey,
                )
            );
        }

        const [_query, values] = await updateCompanyInfoQuery(bodyData);

        const [isUpdateUser] = await pool.query(_query, values);
        if (isUpdateUser.affectedRows > 0) {
            return Promise.resolve(
                setServerResponse(
                    API_STATUS_CODE.OK,
                    'company_info_updated_successfully',
                    lgKey,
                )
            );
        } else {
            return Promise.reject(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'failed_to_update_company_information',
                    lgKey,
                )
            )
        }
    } catch (error) {
        // console.log("🚀 ~ updateUserInfo ~ error:", error)
        return Promise.reject(
            setServerResponse(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                'internal_server_error',
                lgKey,
            )
        )
    }
};


module.exports = {
    updateCompanyInfo
}