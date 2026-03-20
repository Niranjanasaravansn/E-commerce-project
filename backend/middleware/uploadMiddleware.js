const multer  = require('multer');
const path    = require('path');

// Where and how to store uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // save inside uploads/ folder
  },
  filename: (req, file, cb) => {
    // unique filename: fieldname-timestamp.ext  e.g. image-1718000000000.jpg
    const uniqueName = file.fieldname + '-' + Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

// Only allow image files
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const isValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (isValid) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, webp)'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // max 5MB
});

module.exports = upload;