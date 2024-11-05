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

const path = require('path');


/**
 * @description Upload image saved file directory
 */
const imageDir = path.join(process.cwd(), "/uploads/profile-images");

/**
 * @description Upload image saved file directory
 */
const documentDir = path.join(process.cwd(), "/uploads/documents");

/**
 * @description Upload image saved file directory
 */
const idCardDir = path.join(process.cwd(), "/uploads/ID-card");

/**
 * @description Upload image file mimetype
 */
const fileTypes = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];

/**
 * @description Upload file maximum size
 */
const uploadFileSize = 10000000; //10MB

module.exports = {
  imageDir,
  documentDir,
  uploadFileSize,
  fileTypes,
  idCardDir,
};
