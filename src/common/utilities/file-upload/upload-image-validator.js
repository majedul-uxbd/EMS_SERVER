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
const { fileTypes, uploadFileSize } = require("./upload-file-const-value");
const { imageStorage } = require("./image-name-modifiers");

const uploadImageValidator = multer({
    // storage: imageStorage,
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        if (fileTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only image files (PNG, JPEG, JPG, WEBP) are allowed!"));
        }
    },
    limits: {
        fileSize: uploadFileSize,
    },
});

module.exports = {
    uploadImageValidator,
};
