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
const validateScannerBodyData = (req, res, next) => {
    const lgKey = req.body.lg;
    const scannerData = {
        lg: req.body.lg,
        companyId: req.body.companyId,
        projectId: req.body.projectId,
        exhibitionId: req.body.exhibitionId,
    };

    if (!_.isNil(scannerData.companyId)) {
        if (!_.isNumber(scannerData.companyId)) {
            return res.status(API_STATUS_CODE.BAD_REQUEST).send(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'company_id_must_be_number',
                    lgKey
                )
            );
        }
    } else {
        return res.status(API_STATUS_CODE.BAD_REQUEST).send(
            setServerResponse(
                API_STATUS_CODE.BAD_REQUEST,
                'company_id_is_required',
                lgKey
            )
        );
    }

    if (!_.isNil(scannerData.projectId)) {
        if (!_.isNumber(scannerData.projectId)) {
            return res.status(API_STATUS_CODE.BAD_REQUEST).send(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'project_id_must_be_number',
                    lgKey
                )
            );
        }
    } else {
        return res.status(API_STATUS_CODE.BAD_REQUEST).send(
            setServerResponse(
                API_STATUS_CODE.BAD_REQUEST,
                'project_id_is_required',
                lgKey
            )
        );
    }

    if (!_.isNil(scannerData.exhibitionId)) {
        if (!_.isNumber(scannerData.exhibitionId)) {
            return res.status(API_STATUS_CODE.BAD_REQUEST).send(
                setServerResponse(
                    API_STATUS_CODE.BAD_REQUEST,
                    'exhibition_id_must_be_number',
                    lgKey
                )
            );
        }
    } else {
        return res.status(API_STATUS_CODE.BAD_REQUEST).send(
            setServerResponse(
                API_STATUS_CODE.BAD_REQUEST,
                'exhibition_id_is_required',
                lgKey
            )
        );
    }

    req.body.scannerData = scannerData;
    next();
};

module.exports = {
    validateScannerBodyData
}