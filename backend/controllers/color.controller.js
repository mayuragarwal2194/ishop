import mongoose from 'mongoose';
import Color from '../models/color.model.js';
import slugify from 'slugify';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// Create Color
export const addColor = async (req, res) => {
  try {
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

    // 6 . Prevent duplicate color code (only if code is provided)
    if (code) {
      const existingCode = await Color.findOne({ code });
      if (existingCode) {
        throw new ApiError(400, "Color code already exists");
      }
    }

    // 7. create color with safe boolean handling (isActive: true)
    const colorCreated = await Color.create({
      name: name.trim(),
      slug: normalizedSlug,
      code,
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

  } catch (error) {
    console.error("Add Color Error:", error);
    
    // if (error instanceof ApiError) {
    //   throw error;
    // }
    // throw new ApiError(500, "Server Error");
    throw error;
  }
}

// Get all colors
export const getAllColors = async (req, res) => {
  try {

    const filter = {};
    const { isActive, } = req.query;

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const totalColors = await Color.countDocuments(filter);
    const colors = await Color.find(filter);

    // Success Response
    return ApiResponse(
      res,
      200,
      "Colors fetched successfully",
      {
        colors,
        total: totalColors
      }
    );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Server Error");
  }
}

// Get color by id
export const getColorById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid Color Id");
    }

    const color = await Color.findById(id);

    if (!color) {
      throw new ApiError(404, "Color not found");
    }

    return ApiResponse(res, 200, "Color fetched successfully", color);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Server Error");
  }
}

// get color by slug
export const getColorBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const normalizedSlug = slugify(slug, { lower: true, trim: true });

    const color = await Color.findOne({ slug: normalizedSlug });

    if (!color) {
      throw new ApiError(404, "Color not found");
    }

    return ApiResponse(res, 200, "Color fetched successfully", color);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Server Error");
  }
}

// Update Color
export const updateColorById = async (req, res) => {
  try {

    // 1. Validate and extract color ID
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid color id");
    }

    // 2. Find existing color
    const color = await Color.findById(id);
    if (!color) throw new ApiError(404, "Color Not found");

    // 3. Extract fields from request body
    const { name, slug, code, isActive } = req.body;

    // 4. Generate/normalize slug (priority: slug > name > existing) 
    const normalizedSlug = slug
      ? slugify(slug, { lower: true, trim: true })
      : name
        ? slugify(name, { lower: true, trim: true })
        : color.slug;

    if (code) {
      const hexRegex = /^#([0-9A-F]{3}){1,2}$/i;
      if (!hexRegex.test(code)) {
        throw new ApiError(400, "Invalid color code");
      }
    }

    // 5. Prevent duplicate slug (only if slug is changed)
    if (normalizedSlug !== color.slug) {
      const colorExisted = await Color.findOne({
        slug: normalizedSlug,
        _id: { $ne: id }
      });

      if (colorExisted) {
        throw new ApiError(400, "Color already exists")
      }
    }

    // 6. update only given fields
    if (name !== undefined && name.trim() !== "") {
      color.name = name.trim();
    }

    // 7. Assign computed fields (slug, code)
    color.slug = normalizedSlug;
    if (code !== undefined) {
      color.code = code.trim();
    }

    // 8. Safely update boolean flag (only if provided)
    if (isActive !== undefined) {
      color.isActive = isActive === "true" || isActive === true;
    }

    // 9. Save updated color
    await color.save();

    // 10. Return success response
    return ApiResponse(
      res,
      200,
      `${color.name} updated successfully`,
      color,
    );

  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error("Error updating color:", error.message);
    throw new ApiError(500, 'Server Error');
  }
}

// Delete color by id
export const deleteColorById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid Color Id");
    }

    const color = await Color.findById(id);
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