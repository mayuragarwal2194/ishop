import mongoose from "mongoose";
import Category from "../models/category.model.js";
import { deleteImage, uploadImage } from "../services/upload.service.js";
import { DEFAULT_CATEGORY_IMAGE } from "../utils/constants.js";
import slugify from "slugify";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Create Category
export const createCategory = async (req, res) => {
  try {
    //1. Extract fields from request body
    const { name, slug, isActive, isHome, isTop, isPopular } = req.body;

    //2. Validation: name is required
    if (!name || name.trim() === "") {
      throw new ApiError(400, "Category name is required");
    }

    // 3. Generate normalized slug (priority: slug > name)
    const normalizedSlug = slug
      ? slugify(slug, { lower: true, trim: true })
      : slugify(name, { lower: true, trim: true });

    // 4. Existing Category Check
    const categoryExisted = await Category.findOne({ slug: normalizedSlug });
    if (categoryExisted) {
      throw new ApiError(400, "Category already exists");
    }


    // 5. Image Upload Logic (service call)
    let image;
    if (req.file) {
      image = await uploadImage(req.file.path, "ishop/categories");
    }

    // 6. Category Create with safe boolean handling
    const categoryCreated = await Category.create({
      name: name.trim(),
      slug: normalizedSlug,
      image,

      isActive: isActive !== undefined
        ? (isActive === "true" || isActive === true)
        : undefined,
      isHome: isHome !== undefined
        ? (isHome === "true" || isHome === true)
        : undefined,
      isTop: isTop !== undefined
        ? (isTop === "true" || isTop === true)
        : undefined,
      isPopular: isPopular !== undefined
        ? (isPopular === "true" || isPopular === true)
        : undefined,
    });

    // 7.Success Response
    return ApiResponse(
      res,
      201,
      "Category added successfully",
      categoryCreated,
    );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Server Error");
  }
}

// Get all category
export const getAllCategories = async (req, res) => {
  try {
    const filter = {};
    const { isActive, isHome, isTop, isPopular, page, limit } = req.query;

    const pageNumber = Math.max(1, parseInt(page) || 1);
    const limitNumber = Math.max(1, parseInt(limit) || 10);
    const skip = (pageNumber - 1) * limitNumber;


    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }
    if (isHome !== undefined) {
      filter.isHome = isHome === "true";
    }
    if (isTop !== undefined) {
      filter.isTop = isTop === "true";
    }
    if (isPopular !== undefined) {
      filter.isPopular = isPopular === "true";
    }

    const totalCategories = await Category.countDocuments(filter);
    const totalPages = Math.ceil(totalCategories / limitNumber);

    const categories = await Category.find(filter)
      .skip(skip)
      .limit(limitNumber);

    // Success Response
    return ApiResponse(
      res,
      200,
      "Category fetched successfully",
      {
        categories,
        total: totalCategories,
        page: pageNumber,
        totalPages
      }
    );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Server Error");
  }
}

// Get category by id
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid Category Id");
    }

    const category = await Category.findById(id);

    if (!category) {
      throw new ApiError(404, "Category not found");
    }

    return ApiResponse(res, 200, "Category fetched successfully", category);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Server Error");
  }
}

// get category by slug
export const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const normalizedSlug = slugify(slug, { lower: true, trim: true });

    const category = await Category.findOne({ slug: normalizedSlug });

    if (!category) {
      throw new ApiError(404, "Category not found");
    }

    return ApiResponse(res, 200, "Category fetched successfully", category);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Server Error");
  }
}

// Update Category
export const updateCategoryById = async (req, res) => {
  try {

    // 1. Validate and extract category ID
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid category id");
    }

    // 2. Find existing category
    const category = await Category.findById(id);
    if (!category) throw new ApiError(404, "Category Not found");

    // 3. Extract fields from request body
    const { name, slug, isActive, isHome, isTop, isPopular } = req.body;

    // 4. Generate/normalize slug (priority: slug > name > existing)
    const normalizedSlug = slug
      ? slugify(slug, { lower: true, trim: true })
      : name
        ? slugify(name, { lower: true, trim: true })
        : category.slug;

    // 5. Prevent duplicate slug (only if slug is changed)
    if (normalizedSlug !== category.slug) {
      const categoryExisted = await Category.findOne({
        slug: normalizedSlug,
        _id: { $ne: id }
      });

      if (categoryExisted) {
        throw new ApiError(400, "Category already exists")
      }
    }

    // 6. Handle category image update (remove / replace)
    let image = category.image;
    const isImageRemoved = req.body.isImageRemoved === "true";

    // ✅ Replace takes priority
    if (req.file) {
      if (image?.public_id) {
        await deleteImage(image.public_id);
      }

      image = await uploadImage(req.file.path, "ishop/categories");

    } else if (isImageRemoved) {
      if (image?.public_id) {
        await deleteImage(image.public_id);
      }

      // If image is removed and there is no new upload, set to default
      image = {
        url: DEFAULT_CATEGORY_IMAGE,
        public_id: null
      };
    }

    // 7. Update basic fields (only if provided)
    if (name !== undefined && name.trim() !== "") {
      category.name = name.trim();
    }

    // 8. Assign computed fields (slug, image)
    category.slug = normalizedSlug;
    category.image = image;

    // 9. Update boolean fields (only if provided)
    if (isActive !== undefined) {
      category.isActive = isActive === "true" || isActive === true;
    }
    if (isHome !== undefined) {
      category.isHome = isHome === "true" || isHome === true;
    }
    if (isTop !== undefined) {
      category.isTop = isTop === "true" || isTop === true;
    }
    if (isPopular !== undefined) {
      category.isPopular = isPopular === "true" || isPopular === true;
    }

    // 10. Save updated category
    await category.save();

    // 11. Success Response
    return ApiResponse(
      res,
      200,
      `${category.name} updated successfully`,
      category,
    );

  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error("Error updating category:", error.message);
    throw new ApiError(500, 'Server Error');
  }
}

// Delete category by id
export const deleteCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid Category Id");
    }

    const category = await Category.findById(id);
    if (!category) throw new ApiError(404, "Category not found");

    const image = category.image;

    // delete image if exists
    if (image?.public_id) {
      await deleteImage(image.public_id);
    }

    await category.deleteOne();

    return ApiResponse(res, 200, `${category.name} deleted successfully`);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Server Error");
  }
}
