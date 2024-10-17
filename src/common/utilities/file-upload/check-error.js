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

const multer = require("multer");

const errorCheck = (err, req, res, next) => {
  if (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).send({
        err,
        status: "failed",
        message: "file-upload-error",
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
