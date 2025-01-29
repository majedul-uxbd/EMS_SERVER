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

const _ = require('lodash');
const { API_STATUS_CODE } = require('../../consts/error-status');
const { setServerResponse } = require('../../common/set-server-response');


/**
 * This function will validate the scanner body data
 */
const validateVisitorScannerBodyData = (req, res, next) => {
    const errors = [];
    const lgKey = req.body.lg;

    const scannerData = {
        lg: req.body.lg,
        companyId: req.body.companyId,
        projectId: req.body.projectId,
        visitorId: req.body.visitorId,
        exhibitionId: req.body.exhibitionId
    };

    if (!_.isNil(scannerData.companyId)) {
        if (!_.isNumber(scannerData.companyId)) {
            errors.push('Company ID must be a number');
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

    if (!_.isNil(scannerData.visitorId)) {
        if (!_.isNumber(scannerData.visitorId)) {
            errors.push('Visitor ID must be a number');
        }
    } else {
        errors.push('Visitor ID is required');
    }

    if (!_.isNil(scannerData.exhibitionId)) {
        if (!_.isNumber(scannerData.exhibitionId)) {
            errors.push('Exhibition ID must be a number');
        }
    } else {
        errors.push('Exhibition ID is required');
    }

    if (errors.length > 0) {
        return res.status(API_STATUS_CODE.BAD_REQUEST).send(
            setServerResponse(
                API_STATUS_CODE.OK,
                'invalid_data',
                lgKey,
                errors
            )
        )
    }

    req.body.scannerData = scannerData;
    next();
};

module.exports = {
    validateVisitorScannerBodyData
}