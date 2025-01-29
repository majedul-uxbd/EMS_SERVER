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
const validateExhibitionsBodyData = (req, res, next) => {
	const errors = [];
	const bodyData = {
		lg: req.body.lg,
		id: req.body.id,
		exhibitionTitle: exhibitionTitle,
		exhibitionDates: exhibitionDates,
		exhibitionDates: exhibitionVenue,
	} = req.body;


	if (_.isNil(bodyData)) {
		// console.log({ bodyData })
		return res.status(API_STATUS_CODE.BAD_REQUEST).send(
			setServerResponse(
				API_STATUS_CODE.BAD_REQUEST,
				'invalid_data',
				lgKey,
			)
		)
	}

	if (req.originalUrl === "/exhibitions/update") {
		if (_.isNil(bodyData.id) || !_.isNumber(bodyData.id)) {
			return res.status(API_STATUS_CODE.BAD_REQUEST).send(
				setServerResponse(
					API_STATUS_CODE.BAD_REQUEST,
					'exhibition_id_is_required',
					bodyData.lg,
				)
			)
		}
	} else {
		delete bodyData.id;
	}

	if (!_.isNil(bodyData.exhibitionTitle)) {
		if (!_.isString(bodyData.exhibitionTitle)) {
			errors.push('Invalid exhibition title');
		}
	}
	if (!_.isNil(bodyData.exhibitionDates)) {
		if (!_.isArray(bodyData.exhibitionDates)) {
			errors.push('Invalid exhibition date');
		}
	}
	if (!_.isNil(bodyData.exhibitionVenue)) {
		if (!_.isString(bodyData.exhibitionVenue)) {
			errors.push('Invalid exhibition venue');
		}
	}

	if (errors.length > 0) {
		return res.status(API_STATUS_CODE.BAD_REQUEST).send(
			setServerResponse(
				API_STATUS_CODE.OK,
				'invalid_data',
				bodyData.lg,
			)
		)
	}

	req.body.bodyData = bodyData;
	next();
};

module.exports = {
	validateExhibitionsBodyData,
};
