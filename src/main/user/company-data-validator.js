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

const { isValidWebsiteURL, isValidUserCompany, isValidCompanyAddress, isValidEmail } = require("../../common/user-data-validator");
const { API_STATUS_CODE } = require("../../consts/error-status");
const _ = require('lodash');

/**
 * @description This function will validate company information 
 */
const companyDataValidator = (req, res, next) => {
    const errors = [];
    const companyData = {
        id: req.body.id,
        companyName: req.body.companyName,
        website_link: req.body.website_link,
        address: req.body.address,
        email: req.body.email,
    }

    if (req.originalUrl === '/system-admin/update-company') {
        if (_.isNil(companyData.id) || !_.isNumber(companyData.id)) {
            errors.push("Invalid company ID ");
        }
    } else {
        delete companyData.id;
    }
    if (!isValidUserCompany(companyData.companyName)) {
        errors.push('Invalid company name');
    }

    if (!isValidWebsiteURL(companyData.website_link)) {
        errors.push('Invalid website link');
    }

    if (!isValidCompanyAddress(companyData.address)) {
        errors.push('Invalid company address');
    }

    if (!isValidEmail(companyData.email)) {
        errors.push('Invalid company email');
    }

    if (errors.length > 0) {
        return res.status(API_STATUS_CODE.BAD_REQUEST).send({
            status: "failed",
            message: errors,
        });
    }
    // console.log("🚀 ~ validateAddUserData ~ companyData:", companyData)
    // return
    req.body.companyData = companyData;
    next();
}

module.exports = {
    companyDataValidator
}