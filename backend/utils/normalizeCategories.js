import mongoose from "mongoose";
import {ApiError} from "./ApiError.js";

export const normalizeAndValidateCategories = (categories) => {
  // If categories not sent → return undefined (important for update API)
  if (categories === undefined) return undefined;

  let parsedCategories = categories;

  // Convert string → array (form-data fix)
  if (typeof parsedCategories === "string") {
    parsedCategories = [parsedCategories];
  }

  // Ensure array
  if (!Array.isArray(parsedCategories)) {
    throw new ApiError(400, "Categories must be an array");
  }

  // Validate ObjectIds
  const isValid = parsedCategories.every(id =>
    mongoose.Types.ObjectId.isValid(id)
  );

  if (!isValid) {
    throw new ApiError(400, "Invalid category id in categories");
  }

  return parsedCategories;
};