import mongoose from "mongoose";
import { ApiError } from "./ApiError.js";

export const validateCategoryId = (category) => {
  if (!category) {
    throw new ApiError(400, "Category is required");
  }

  if (!mongoose.Types.ObjectId.isValid(category)) {
    throw new ApiError(400, "Invalid category id");
  }

  return category;
};