/**
 * @author Md. Majedul Islam <https://github.com/majedul-uxbd> 
 * Software Engineer,
 * Ultra-X BD Ltd.
 *
 * @copyright All right reserved Majedul
 * 
 * @description 
 * 
 */

const _ = require('lodash');
const { API_STATUS_CODE } = require('../../consts/error-status');

/**
 * This function will validate the scanner body data
 */
const validateScannerBodyData = (req, res, next) => {
    const errors = [];
    const scannerData = {
        companyId: req.body.companyId,
        projectId: req.body.projectId,
    };

    if (!_.isNil(scannerData.companyId)) {
        if (!_.isNumber(scannerData.companyId)) {
            errors.push('company ID must be a number');
        }
    } else {
        errors.push('Company ID is required');
    }
    if (!_.isNil(scannerData.projectId)) {
        if (!_.isNumber(scannerData.projectId)) {
            errors.push('Project ID must be a number');
        }
    } else {
        errors.push('Project ID is required');
    }

    // console.log("🚀 ~ validateScannerBodyData ~ scannerData:", scannerData)
    // console.log("🚀 ~ validateScannerBodyData ~ errors:", errors)


    if (errors.length > 0) {
        return res.status(API_STATUS_CODE.BAD_REQUEST).send({
            statue: 'failed',
            message: errors
        })
    }

    req.body.scannerData = scannerData;
    next();
};

module.exports = {
    validateScannerBodyData
}