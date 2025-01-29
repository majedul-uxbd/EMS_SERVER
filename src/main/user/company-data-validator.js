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

const { isValidWebsiteURL,
    isValidUserCompany,
    isValidCompanyAddress,
    isValidEmail
} = require("../../common/user-data-validator");
const { API_STATUS_CODE } = require("../../consts/error-status");
const _ = require('lodash');

/**
 * @description This function will validate company information 
 */
const companyDataValidator = (req, res, next) => {
    const lgKey = req.body.lg;

    const companyData = {
        lg: req.body.lg,
        id: req.body.id,
        companyName: req.body.companyName,
        website_link: req.body.website_link,
        address: req.body.address,
        email: req.body.email,
    }

    if (req.originalUrl === '/system-admin/update-company') {
        if (_.isNil(companyData.id) || !_.isNumber(companyData.id)) {
            return res.status(API_STATUS_CODE.BAD_REQUEST).send(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'invalid_company_id',
                    lgKey,
                )
            );
        }
    } else {
        delete companyData.id;
    }

    if (!isValidUserCompany(companyData.companyName)) {
        return res.status(API_STATUS_CODE.BAD_REQUEST).send(
            setServerResponse(
                API_STATUS_CODE.BAD_REQUEST,
                'invalid_company_name',
                lgKey,
            )
        );
    }

    if (!isValidWebsiteURL(companyData.website_link)) {
        return res.status(API_STATUS_CODE.BAD_REQUEST).send(
            setServerResponse(
                API_STATUS_CODE.BAD_REQUEST,
                'invalid_company_website',
                lgKey,
            )
        );
    }

    if (!isValidCompanyAddress(companyData.address)) {
        return res.status(API_STATUS_CODE.BAD_REQUEST).send(
            setServerResponse(
                API_STATUS_CODE.BAD_REQUEST,
                'invalid_company_address',
                lgKey,
            )
        );
    }

    if (!isValidEmail(companyData.email)) {
        return res.status(API_STATUS_CODE.BAD_REQUEST).send(
            setServerResponse(
                API_STATUS_CODE.BAD_REQUEST,
                'invalid_company_email',
                lgKey,
            )
        );
    }

    req.body.companyData = companyData;
    next();
}

module.exports = {
    companyDataValidator
}