import mongoose from "mongoose";
import slugify from "slugify";
import SubCategory from "../models/subCategory.model.js";
import { deleteImage, uploadImage } from "../services/upload.service.js";
import { DEFAULT_CATEGORY_IMAGE } from "../utils/constants.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateCategoryId } from "../utils/validateCategoryId.js";
import { parseBoolean } from "../helper/parseBoolean.helper.js";
import Category from "../models/category.model.js";
import { getPagination } from "../utils/pagination.js";
import { buildSearchQuery } from "../utils/search.js";
import { validateObjectId } from "../utils/validateObjectId.js";

// Create SubCategory
export const createSubCategory = asyncHandler(async (req, res) => {

  //1- Extract data from request body
  const { name, slug, category, isActive, isHome, isTop, isPopular } = req.body;

  //2- Validation: name is required
  if (!name || name.trim() === "") {
    throw new ApiError(400, "SubCategory name is required");
  }

  // 3- Validate category format
  const validCategory = validateCategoryId(category);

  // 4- Check category existence
  const categoryExists = await Category.findById(validCategory);
  if (!categoryExists) {
    throw new ApiError(404, "Category not found");
  }

  //5- Generate normalized slug (priority: slug > name)
  const normalizedSlug = slug
    ? slugify(slug, { lower: true, trim: true })
    : slugify(name, { lower: true, trim: true });


  //6- Image Upload Logic (service call)
  let image;
  if (req.file) {
    image = await uploadImage(req.file.path, "ishop/subcategories");
  }

  try {
    // 7- Create SubCategory
    const subCategoryCreated = await SubCategory.create({
      name: name.trim(),
      slug: normalizedSlug,
      category: validCategory,
      image,
      isActive: parseBoolean(isActive),
      isHome: parseBoolean(isHome),
      isTop: parseBoolean(isTop),
      isPopular: parseBoolean(isPopular),
    });

    // 8- Response
    return ApiResponse(
      res,
      201,
      subCategoryCreated,
      "SubCategory created successfully"
    );

  } catch (error) {

    // 🔥 Important: rollback uploaded image if DB fails
    if (image?.public_id) {
      await deleteImage(image.public_id);
    }

    throw error; // handled by global errorHandler
  }
});

// Get all subcategories
export const getAllSubCategories = asyncHandler(async (req, res) => {
  const filter = {};

  const { isActive, isHome, isTop, isPopular, category, search } = req.query;

  // 🔥 Use global pagination
  const { page, limit, skip } = getPagination(req.query);

  // Boolean filters
  if (isActive !== undefined) filter.isActive = parseBoolean(isActive);
  if (isHome !== undefined) filter.isHome = parseBoolean(isHome);
  if (isTop !== undefined) filter.isTop = parseBoolean(isTop);
  if (isPopular !== undefined) filter.isPopular = parseBoolean(isPopular);

  // Category filter
  if (category) {
    const validCategory = validateCategoryId(category);
    filter.category = validCategory;
  }

  // Search filter (based on name and slug)
  const searchQuery = buildSearchQuery(search, ["name", "slug"]);

  // Combine filters and search into final query
  const finalFilter = { ...filter, ...searchQuery };

  // total count for pagination metadata
  const totalSubCategories = await SubCategory.countDocuments(finalFilter);
  const totalPages = Math.ceil(totalSubCategories / limit);

  // fetch subcategories with pagination and category details
  const subCategories = await SubCategory.find(finalFilter)
    .skip(skip)
    .limit(limit)
    .populate("category", "name slug");

  return ApiResponse(
    res,
    200,
    "SubCategories fetched successfully",
    subCategories,
    {
      total: totalSubCategories,
      page,
      totalPages
    }
  );
});

// Get SubCategory by ID
export const getSubCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate ID format
  const validId = validateObjectId(id, "SubCategory");

  // Fetch subcategory with category details
  const subCategory = await SubCategory.findById(validId).populate("category", "name slug");

  // Check existence
  if (!subCategory) {
    throw new ApiError(404, "SubCategory not found");
  }

  return ApiResponse(
    res,
    200,
    "SubCategory fetched successfully",
    subCategory
  );
});

// Delete SubCategory
export const deleteSubCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate ID format
  const validId = validateObjectId(id, "SubCategory");

  const subCategory = await SubCategory.findById(validId);

  if (!subCategory) {
    throw new ApiError(404, "SubCategory not found");
  }

  const deleted = await SubCategory.findByIdAndDelete(validId);

  // Delete associated image if exists
  if (subCategory.image?.public_id) {
    try {
      await deleteImage(subCategory.image.public_id);
    } catch (err) {
      console.error("Image deletion failed:", err.message);
    }
  }

  return ApiResponse(
    res,
    200,
    "SubCategory deleted successfully",
    { deleted: deleted._id }
  );
});

// Update SubCategory
export const updateSubCategory = asyncHandler(async (req, res) => {

  // 1. Validate and extract ID
  const { id } = req.params;
  const validId = validateObjectId(id, "SubCategory");

  // 2. Find existing subcategory
  const subCategory = await SubCategory.findById(validId);
  if (!subCategory) {
    throw new ApiError(404, "SubCategory not found");
  }

  // 3. Extract fields from request body
  const { name, slug, category, isActive, isHome, isTop, isPopular } = req.body;

  // 4. Validate category (if provided)
  let validCategory;
  if (category) {
    validCategory = validateCategoryId(category);

    const categoryExists = await Category.findById(validCategory);
    if (!categoryExists) {
      throw new ApiError(404, "Category not found");
    }
  }

  // 5. Generate normalized slug (if name or slug changes)
  let normalizedSlug;
  if (slug || name) {
    normalizedSlug = slug
      ? slugify(slug, { lower: true, trim: true })
      : slugify(name, { lower: true, trim: true });
  }

  // 6. Prevent duplicate slug within same category
  if (normalizedSlug) {
    const existing = await SubCategory.findOne({
      _id: { $ne: validId },
      slug: normalizedSlug,
      category: validCategory || subCategory.category
    });

    if (existing) {
      throw new ApiError(400, "Slug already exists in this category");
    }
  }

  // 7. Upload new image if provided
  let newImage;
  if (req.file) {
    newImage = await uploadImage(req.file.path, "ishop/subcategories");
  }

  try {
    // 8. Update fields (only if provided)
    if (name !== undefined && name.trim() !== "") {
      subCategory.name = name.trim();
    }

    if (normalizedSlug) {
      subCategory.slug = normalizedSlug;
    }

    if (validCategory) {
      subCategory.category = validCategory;
    }

    if (isActive !== undefined) subCategory.isActive = parseBoolean(isActive);
    if (isHome !== undefined) subCategory.isHome = parseBoolean(isHome);
    if (isTop !== undefined) subCategory.isTop = parseBoolean(isTop);
    if (isPopular !== undefined) subCategory.isPopular = parseBoolean(isPopular);

    // 9. Handle image replacement (SAFE ORDER)
    let oldPublicId;
    if (newImage) {
      oldPublicId = subCategory.image?.public_id;
      subCategory.image = newImage;
    }

    // 10. Save updated document FIRST
    const updatedSubCategory = await subCategory.save();

    // 11. Delete old image AFTER successful DB save
    if (newImage && oldPublicId) {
      try {
        await deleteImage(oldPublicId);
      } catch (err) {
        console.error("Old image delete failed:", err.message);
      }
    }

    // 12. Send success response
    return ApiResponse(
      res,
      200,
      "SubCategory updated successfully",
      { subCategory: updatedSubCategory }
    );

  } catch (error) {

    // 13. Rollback: delete newly uploaded image if DB save fails
    if (newImage?.public_id) {
      try {
        await deleteImage(newImage.public_id);
      } catch (err) {
        console.error("Rollback image delete failed:", err.message);
      }
    }

    throw error; // handled by global error handler
  }
});