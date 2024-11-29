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

const multer = require("multer");
const { API_STATUS_CODE } = require("../../../consts/error-status");

const errorCheck = (err, req, res, next) => {
	if (err) {
		if (err instanceof multer.MulterError) {
			return res.status(API_STATUS_CODE.BAD_REQUEST).send({
				err,
				status: "failed",
				message: "Failed to upload file",
			});
		} else {
			return res.status(API_STATUS_CODE.BAD_REQUEST).send({
				status: "failed",
				message: err?.message
			});
		}
	} else {
		next();
	}
};

module.exports = {
	errorCheck,
};
