import mongoose from "mongoose";
import Brand from "../models/brand.model.js";
import { uploadImage, deleteImage } from "../services/upload.service.js";
import slugify from "slugify";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { normalizeAndValidateCategories } from "../utils/normalizeCategories.js";
import { DEFAULT_BRAND_IMAGE } from "../utils/constants.js";


// Create Brand
export const createBrand = async (req, res) => {
  try {

    //1. Extract fields from request body
    const { name, slug, isActive, isHome, isTop, isPopular, categories } = req.body;

    //2. Validation: name is required
    if (!name || name.trim() === "") {
      throw new ApiError(400, "Brand name is required");
    }

    // 3. Generate normalized slug (priority: slug > name)
    const normalizedSlug = slug
      ? slugify(slug, { lower: true, trim: true })
      : slugify(name, { lower: true, trim: true });

    // 4. Existing Brand Check
    const brandExisted = await Brand.findOne({ slug: normalizedSlug });
    if (brandExisted) {
      throw new ApiError(400, "Brand already exists");
    }

    // 5. Normalize + Validate categories
    const parsedCategories = normalizeAndValidateCategories(categories);

    // 6. Image/logo Upload Logic (service call)
    let logo;
    if (req.file) {
      logo = await uploadImage(req.file.path, "ishop/brands");
    }

    // 7. Create brand with safe boolean handling
    const brandCreated = await Brand.create({
      name: name.trim(),
      slug: normalizedSlug,
      logo,

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

      categories: parsedCategories || [],
    });

    // 8. Success Response
    return ApiResponse(
      res,
      201,
      "Brand added successfully",
      brandCreated,
    );
  } catch (error) {
    throw error;
  }
}

// Get All Brands
export const getAllBrands = async (req, res) => {
  try {
    const filter = {};
    const { isActive, isHome, isTop, isPopular, categories, page, limit } = req.query;

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
    if (categories) {
      const categoryArray = categories.split(",").map(id =>
        new mongoose.Types.ObjectId(id)
      );

      filter.categories = { $in: categoryArray };
    }

    const totalBrands = await Brand.countDocuments(filter);
    const totalPages = Math.ceil(totalBrands / limitNumber);

    const brands = await Brand.find(filter)
      .skip(skip)
      .limit(limitNumber)
      .populate("categories", "name slug");

    return ApiResponse(
      res,
      200,
      "Brands fetched successfully",
      brands,
      {
        total: totalBrands,
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

// Get Brand by id
export const getBrandById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid Brand ID");
    }
    const brand = await Brand.findById(id).populate("categories", "name slug");
    if (!brand) {
      throw new ApiError(404, "Brand not found");
    }
    return ApiResponse(
      res,
      200,
      "Brand fetched successfully",
      brand
    );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Server Error");
  }
}

// Get Brand by slug
export const getBrandBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const normalizedSlug = slugify(slug, { lower: true, trim: true });

    const brand = await Brand.findOne({ slug: normalizedSlug })
      .populate("categories", "name slug");

    if (!brand) {
      throw new ApiError(404, "Brand not found");
    }
    return ApiResponse(
      res,
      200,
      "Brand fetched successfully",
      brand
    );

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Server Error");
  }
}

// Delete Brand by id
export const deleteBrandById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid Brand ID");
    }

    const brand = await Brand.findById(id);

    if (!brand) {
      throw new ApiError(404, "Brand not found");
    }

    const logo = brand.logo;

    // delete logo from cloudinary if exists and not default
    if (logo?.public_id) {
      await deleteImage(logo.public_id);
    }

    await brand.deleteOne();

    return ApiResponse(
      res,
      200,
      "Brand deleted successfully",
      null
    );

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Server Error");
  }
}

// Update Brand
export const updateBrandById = async (req, res) => {
  try {

    // 1. Validate and extract brand ID
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid Brand ID");
    }

    // 2. Find existing brand
    const brand = await Brand.findById(id);
    if (!brand) throw new ApiError(404, "Brand not found");

    // 3. Extract fields from request body
    const { name, slug, isActive, isHome, isTop, isPopular, categories } = req.body;

    // 4. Generate/normalize slug (priority: slug > name > existing) 
    const normalizedSlug = slug
      ? slugify(slug, { lower: true, trim: true })
      : name
        ? slugify(name, { lower: true, trim: true })
        : brand.slug;


    // 5. Prevent duplicate slug (only if slug is changed)
    if (normalizedSlug !== brand.slug) {
      const existingBrand = await Brand.findOne({
        slug: normalizedSlug,
        _id: { $ne: id }
      });

      if (existingBrand) {
        throw new ApiError(400, "Brand already exists");
      }
    }

    // 6. Handle logo update (remove / replace)
    let logo = brand.logo;
    const isImageRemoved = req.body.isImageRemoved === "true";

    // ✅ Replace takes priority
    if (req.file) {
      if (logo?.public_id) {
        await deleteImage(logo.public_id);
      }

      logo = await uploadImage(req.file.path, "ishop/brands");

    } else if (isImageRemoved) {
      if (logo?.public_id) {
        await deleteImage(logo.public_id);
      }

      // If image is removed and there is no new upload, set to default
      logo = {
        url: DEFAULT_BRAND_IMAGE,
        public_id: null
      };
    }

    // 7. Update basic fields (only if provided)
    if (name !== undefined && name.trim() !== "") {
      brand.name = name.trim();
    }

    // 8. Validate and update categories (relation handling)
    if (categories !== undefined) {
      const parsedCategories = normalizeAndValidateCategories(categories);
      brand.categories = parsedCategories;
    }

    // 9. Assign computed fields (slug, logo)
    brand.slug = normalizedSlug;
    brand.logo = logo;


    // 10. Safely update boolean flags (only if provided)
    if (isActive !== undefined) {
      brand.isActive = isActive === "true" || isActive === true;
    }
    if (isHome !== undefined) {
      brand.isHome = isHome === "true" || isHome === true;
    }
    if (isTop !== undefined) {
      brand.isTop = isTop === "true" || isTop === true;
    }
    if (isPopular !== undefined) {
      brand.isPopular = isPopular === "true" || isPopular === true;
    }


    // 11. Save updated brand
    await brand.save();


    return ApiResponse(
      res,
      200,
      `${brand.name} updated successfully`,
      brand,
    );

  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error("Error updating brand:", error.message);
    throw new ApiError(500, 'Server Error');
  }
}