const fs = require('fs');

const deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (error) => {
      if (error) {
        console.error('Error deleting file:', error);
        reject(error);
      } else {
        console.log('File successfully deleted:', filePath);
        resolve();
      }
    });
  });
};

module.exports = { deleteFile };
