const multer = require("multer");
function getCurrentDate() {
  const currentDate = new Date();
  const day = String(currentDate.getDate()).padStart(2, "0");
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const year = String(currentDate.getFullYear()).slice(-2);

  return `${day}-${month}-${year}`;
}
const formattedDate = getCurrentDate();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Specify the destination folder for uploaded files
    cb(null, "upload/task_submission/");
  },

  filename: function (req, file, cb) {
    // Generate a unique filename for the uploaded file
    const uniqueFilename =
      Math.floor(Math.random() * 1000000) +
      "_" +
      formattedDate +
      "_" +
      file.originalname;
    cb(null, uniqueFilename);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "text/plain") {
    cb(null, true);
  } else {
    cb(new Error("File must be a .txt file"), false);
  }
};
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

const uploadPro = (req, res, next) => {
  upload.single("taskFile")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error(err);
      res.status(400).json({ success: false, error: "File upload error" });
    } else if (err) {
      console.error(err);
      res.status(500).json({ success: false, error: "Server error" });
    } else {
      next();
    }
  });
};
module.exports = { uploadPro };
