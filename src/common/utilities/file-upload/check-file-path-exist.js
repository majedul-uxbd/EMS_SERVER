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

const fs = require("fs");
const path = require("path");
const { imageDir, documentDir, idCardDir } = require("./upload-file-const-value");

/**
 * @description This function is used to check the file saved directory is exist. If not then create the path
 */
const checkIfFileSavePathExist = async (req, res, next) => {
    let UPLOAD_FOLDER;

    if (req.originalUrl === '/uploader/file-upload') {
        UPLOAD_FOLDER = documentDir;
    }
    if (req.originalUrl === '/uploader/upload-image') {
        UPLOAD_FOLDER = imageDir;
    }
    if (req.originalUrl === '/common/generate-id-card') {
        UPLOAD_FOLDER = idCardDir;
    }

    const normalize_path_folder = path.normalize(UPLOAD_FOLDER);

    // Ensure the folder exists or create it
    if (!fs.existsSync(normalize_path_folder)) {
        fs.mkdirSync(normalize_path_folder, { recursive: true });
    }
    next();

}

module.exports = {
    checkIfFileSavePathExist
}