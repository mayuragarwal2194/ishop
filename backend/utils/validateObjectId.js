import mongoose from "mongoose";
import { ApiError } from "./ApiError.js";

export const validateObjectId = (id, fieldName = "ID") => {
  if (!id) {
    throw new ApiError(400, `${fieldName} is required`);
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, `Invalid ${fieldName} Id`);
  }

  return id;
};