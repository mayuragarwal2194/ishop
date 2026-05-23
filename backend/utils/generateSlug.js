import slugify from "slugify";
import { ApiError } from "./ApiError.js";

export const generateSlug = (input, fallback) => {

  // Priority: input > fallback
  const value = input && input.trim() !== ""
    ? input
    : fallback;

  if (!value || value.trim() === "") {
    throw new ApiError(400, "Invalid slug input");
  }

  return slugify(value, {
    lower: true,
    trim: true,
    strict: true, // removes special chars
  });
};