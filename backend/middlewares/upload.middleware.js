import multer from "multer";

// 1. Use default temp storage (no need to customize for Cloudinary)
const storage = multer.diskStorage({});

// 2. Allow ONLY image files
const fileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

// 3. Multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

export default upload;