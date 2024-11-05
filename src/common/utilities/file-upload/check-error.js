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

const errorCheck = (err, req, res, next) => {
  if (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).send({
        err,
        status: "failed",
        message: "Failed to upload file",
      });
    } else {
      return res.send(err?.message);
    }
  } else {
    next();
  }
};

module.exports = {
  errorCheck,
};
