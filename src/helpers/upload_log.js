const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/logs/new');
  },
  filename: function (req, file, cb) {
    cb(null, ~Date.now().toString() + '_' + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  // Reject a file
  if (
    file.mimetype === 'text/plain' || // For log files
    file.mimetype === 'application/json' // For JSON files
  ) {
    cb(null, true);
  } else {
    // Accept a file
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 8, // 8 MB limit
  },
  fileFilter: fileFilter, // Corrected function name
});

module.exports = { upload };
