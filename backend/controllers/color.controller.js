import mongoose from 'mongoose';
import Color from '../models/color.model.js';
import slugify from 'slugify';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPagination } from '../utils/pagination.js';
import { buildSearchQuery } from '../utils/search.js';
import { parseBoolean } from '../helper/parseBoolean.helper.js';
import { validateObjectId } from '../utils/validateObjectId.js';

// Create Color
export const addColor = asyncHandler(async (req, res) => {
  // 1. Extract fields from request body
  const { name, slug, code, isActive } = req.body;

  // 2. Validation: name is required
  if (!name || name.trim() === "") {
    throw new ApiError(400, "Color name is required");
  }

  // 3. Validate color code (if provided)
  const hexRegex = /^#([0-9A-F]{3}){1,2}$/i;
  if (code && !hexRegex.test(code)) {
    throw new ApiError(400, "Invalid color code");
  }

  // 4. Generate normalized slug (priority: slug > name)
  const normalizedSlug = slug
    ? slugify(slug, { lower: true, trim: true })
    : slugify(name, { lower: true, trim: true });

  // 5. Existing Color Check
  const colorExisted = await Color.findOne({ slug: normalizedSlug });
  if (colorExisted) {
    throw new ApiError(400, "Color already exists");
  }

  // 5. Normalize code
  const normalizedCode = code ? code.toUpperCase() : undefined;


  // 6 . Prevent duplicate color code (only if code is provided)
  if (code) {
    const existingCode = await Color.findOne({ code: normalizedCode });
    if (existingCode) {
      throw new ApiError(400, "Color code already exists");
    }
  }

  // 7. create color with safe boolean handling (isActive: true)
  const colorCreated = await Color.create({
    name: name.trim(),
    slug: normalizedSlug,
    code: normalizedCode,
    isActive: isActive !== undefined
      ? (isActive === "true" || isActive === true)
      : undefined,
  });

  // 8. Success Response
  return ApiResponse(
    res,
    201,
    "Color added successfully",
    colorCreated,
  );
})

// Get all colors
export const getAllColors = asyncHandler(async (req, res) => {

  const filter = {};
  const { isActive, search } = req.query;

  // 🔥 Use global pagination
  const { page, limit, skip } = getPagination(req.query);

  // Boolean filters
  if (isActive !== undefined) filter.isActive = parseBoolean(isActive);

  // Search filter (based on name and slug)
  const searchQuery = buildSearchQuery(search, ["name", "slug"]);

  // Combine filters and search into final query
  const finalFilter = { ...filter, ...searchQuery };

  // total count for pagination metadata
  const totalColors = await Color.countDocuments(finalFilter);
  const totalPages = Math.ceil(totalColors / limit);

  // fetch colors with pagination and category details
  const colors = await Color.find(finalFilter)
    .skip(skip)
    .limit(limit);

  // Success Response
  return ApiResponse(
    res,
    200,
    "Colors fetched successfully",
    colors,
    {
      total: totalColors,
      page,
      totalPages
    }
  );
});

// Get color by id
export const getColorById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate ID format
  const validId = validateObjectId(id, "Color");

  // Fetch color by ID
  const color = await Color.findById(validId);
  if (!color) {
    throw new ApiError(404, "Color not found");
  }

  return ApiResponse(
    res,
    200,
    "Color fetched successfully",
    color
  );
});

// get color by slug
export const getColorBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const normalizedSlug = slugify(slug, { lower: true, trim: true });

  const color = await Color.findOne({ slug: normalizedSlug });

  if (!color) {
    throw new ApiError(404, "Color not found");
  }

  return ApiResponse(res, 200, "Color fetched successfully", color);
});

// Update Color
export const updateColorById = asyncHandler(async (req, res) => {

  // 1. Validate and extract color ID
  const { id } = req.params;
  const validId = validateObjectId(id, "Color");

  // 2. Find existing color
  const color = await Color.findById(validId);
  if (!color) throw new ApiError(404, "Color Not found");

  // 3. Extract fields from request body
  const { name, slug, code, isActive } = req.body;

  // 4. Generate/normalize slug (priority: slug > name > existing) 
  const normalizedSlug = slug
    ? slugify(slug, { lower: true, trim: true })
    : name
      ? slugify(name, { lower: true, trim: true })
      : color.slug;

  // 5. Prevent duplicate slug (only if slug is changed)
  if (normalizedSlug !== color.slug) {
    const colorExisted = await Color.findOne({
      slug: normalizedSlug,
      _id: { $ne: validId }
    });

    if (colorExisted) {
      throw new ApiError(400, "Color already exists")
    }
  }

  // 6. Validate + normalize code
  let normalizedCode;
  if (code !== undefined) {
    const hexRegex = /^#([0-9A-F]{3}){1,2}$/i;

    if (!hexRegex.test(code)) {
      throw new ApiError(400, "Invalid color code");
    }

    normalizedCode = code.toUpperCase();

    if (normalizedCode !== color.code) {
      const existingCode = await Color.findOne({
        code: normalizedCode,
        _id: { $ne: validId }
      });

      if (existingCode) {
        throw new ApiError(400, "Color code already exists");
      }
    }
  }

  // 7. Update fields
  if (name !== undefined && name.trim() !== "") color.name = name.trim();
  if (normalizedSlug !== color.slug) color.slug = normalizedSlug;
  if (normalizedCode !== undefined) color.code = normalizedCode;
  if (isActive !== undefined) color.isActive = parseBoolean(isActive);

  // 8. Save updated color
  await color.save();

  // 9. Return success response
  return ApiResponse(
    res,
    200,
    `Color updated successfully`,
    color,
  );
});

// Delete color by id
export const deleteColorById = async (req, res) => {
  try {
    const { id } = req.params;

    const validId = validateObjectId(id, "Color");

    const color = await Color.findById(validId);
    if (!color) throw new ApiError(404, "Color not found");

    await color.deleteOne();

    return ApiResponse(res, 200, `${color.name} deleted successfully`);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Server Error");
  }
}