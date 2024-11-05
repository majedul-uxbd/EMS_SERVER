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


/**
 * This function will validate the exhibitions body data 
 */
const validateExhibitionsBodyData = (req, res, next) => {
	const errors = [];
	const bodyData = {
		id: req.body.id,
		exhibitionTitle,
		exhibitionDates,
		exhibitionVenue,
	} = req.body;


	if (_.isNil(bodyData)) {
		// console.log({ bodyData })
		return res.status(API_STATUS_CODE.BAD_REQUEST).send({
			status: 'failed',
			message: "invalid-data"
		})
	}

	if (req.originalUrl === "/exhibitions/update") {
		if (_.isNil(bodyData.id) || !_.isNumber(bodyData.id)) {
			errors.push("Invalid exhibition ID ");
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
