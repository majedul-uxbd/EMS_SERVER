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
// const { storage } = require("../nameStorage/storage-filename-modifiers");
const { uploadFileSize } = require("./upload-file-const-value");
const { storage } = require("./storage-filename-modifiers");

const uploadFileValidator = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("ONly .pdf file is allowed!"));
    }
  },
  limits: {
    fileSize: uploadFileSize,
  },
});

module.exports = {
  uploadFileValidator,
};
