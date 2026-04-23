import { ApiError } from "../utils/ApiError.js";


export const errorHandler = (err, req, res, next) => {
  console.error(err);
  // 🔹 Multer file type error
  if (err.message === "Only image files are allowed") {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  // 🔹 Multer file size error
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "File size should be less than 5MB"
    });
  }


  // 🔥 MongoDB duplicate key error (IMPORTANT ADDITION)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || err.keyValue || {})[0];

    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }

  // 🔹 Custom ApiError handling
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  }

  // 🔹 Unknown errors (fallback)
  return res.status(500).json({
    success: false,
    message: "Internal Server Error"
  });
};