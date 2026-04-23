import mongoose from "mongoose";
import SubCategory from "../models/subCategory.model.js";
import { deleteImage, uploadImage } from "../services/upload.service.js";
import { DEFAULT_CATEGORY_IMAGE } from "../utils/constants.js";
import slugify from "slugify";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create SubCategory
export const createSubCategory = asyncHandler(async (req, res) => {
  //Extract data from request body
});