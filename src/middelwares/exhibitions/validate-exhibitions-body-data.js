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

const validateExhibitionsBodyData = (req, res, next) => {
	const errors = [];
	const bodyData = {
		exhibitionTitle,
		exhibitionStartDate,
		exhibitionEndDate,
		exhibitionVenue,
	} = req.body;

	if (_.isNil(bodyData)) {
		// console.log({ bodyData })
		return res.status(API_STATUS_CODE.BAD_REQUEST).send({
			status: 'failed',
			message: "invalid-data"
		})
	}
	if (!_.isNil(bodyData.exhibitionTitle)) {
		if (!_.isString(bodyData.exhibitionTitle)) {
			errors.push('invalid-exhibition-title');
		}
	}
	if (!_.isNil(bodyData.exhibitionStartDate)) {
		if (!_.isString(bodyData.exhibitionStartDate)) {
			errors.push('invalid-exhibition-start-date');
		}
	}
	if (!_.isNil(bodyData.exhibitionEndDate)) {
		if (!_.isString(bodyData.exhibitionEndDate)) {
			errors.push('invalid-exhibition-end-date');
		}
	}
	if (!_.isNil(bodyData.exhibitionVenue)) {
		if (!_.isString(bodyData.exhibitionVenue)) {
			errors.push('invalid-exhibition-venue');
		}
	}

	if (errors.length > 0) {
		return res.status(API_STATUS_CODE.BAD_REQUEST).send({
			status: 'failed',
			message: errors
		})
	}
	req.body.bodyData = bodyData;
	next();
};

module.exports = {
	validateExhibitionsBodyData,
};
