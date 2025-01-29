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

const _ = require("lodash");
const { API_STATUS_CODE } = require("../../consts/error-status");
const { setServerResponse } = require("../../common/set-server-response");


/**
 * This function will validate the exhibitions body data 
 */
const validateEventBodyData = (req, res, next) => {
    const lgKey = req.body.lg;

    const errors = [];
    const bodyData = {
        exhibitionId: exhibitionId,
        exhibitionDayId: exhibitionDayId,
        exhibitionDate: exhibitionDate,
        exhibitionDay: exhibitionDay,
        title: title,
        descriptions: descriptions

    } = req.body;


    if (_.isNil(bodyData)) {
        // console.log({ bodyData })
        return res.status(API_STATUS_CODE.BAD_REQUEST).send(
            setServerResponse(
                API_STATUS_CODE.BAD_REQUEST,
                'invalid_data',
                lgKey
            )
        )
    }
    if (_.isNil(bodyData.exhibitionId) || !_.isNumber(bodyData.exhibitionId)) {
        errors.push('Invalid exhibition ID');
    }

    if (_.isNil(bodyData.exhibitionDayId) || !_.isNumber(bodyData.exhibitionDayId)) {
        errors.push('Invalid exhibition day ID');
    }

    if (_.isNil(bodyData.exhibitionDate) || !_.isString(bodyData.exhibitionDate)) {
        errors.push('Invalid exhibition date');
    }
    if (_.isNil(bodyData.exhibitionDay) || !_.isString(bodyData.exhibitionDay)) {
        errors.push('Invalid exhibition day');
    }

    if (!_.isNil(bodyData.title)) {
        const minLength = 3;
        const maxLength = 50;

        if (_.isString(bodyData.title)) {
            if (bodyData.title.length > maxLength || bodyData.title.length < minLength) {
                errors.push('Invalid event title');
            }
        } else {
            errors.push('Invalid event title');
        }
    }

    if (!_.isNil(bodyData.descriptions)) {
        const minLength = 4;
        const maxLength = 90;
        if (_.isString(bodyData.descriptions)) {
            if (bodyData.descriptions.length > maxLength || bodyData.descriptions.length < minLength) {
                errors.push('Invalid event description');
            }
        } else {
            errors.push('Invalid event description');
        }
    }

    if (errors.length > 0) {
        return res.status(API_STATUS_CODE.BAD_REQUEST).send(
            setServerResponse(
                API_STATUS_CODE.BAD_REQUEST,
                'invalid_data',
                lgKey
            )
        )
    }

    req.body.bodyData = bodyData;
    next();
};

module.exports = {
    validateEventBodyData,
};
