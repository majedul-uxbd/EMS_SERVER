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

const path = require("path");
const multer = require("multer");
const { imageDir } = require("./upload-file-const-value");


const normalize_path_folder = path.normalize(imageDir);

const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, normalize_path_folder);
    },
    filename: (req, file, cb) => {
        const fileExt = path.extname(file.originalname);
        const fileName =
            file.originalname
                .replace(fileExt, "")
                .toUpperCase()
                .split(" ")
                .join("_") + Date.now();
        cb(null, fileName + fileExt);
    },
});

module.exports = {
    imageStorage,
};
