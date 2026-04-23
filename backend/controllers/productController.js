import mongoose, { SchemaTypes } from "mongoose";
import Product from "../models/product.model.js";
import { uploadImage, deleteImage } from "../services/upload.service.js";
import slugify from "slugify";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { normalizeAndValidateCategories } from "../utils/normalizeCategories.js";
import { DEFAULT_PRODUCT_IMAGE } from "../utils/constants.js";

export const createProduct = async (req, res) => {
  try {
    // 1. Extract fields from request body
    const {
      name,
      slug,
      description,
      category,
      brand,
      variants
    } = req.body;

    // 2. Validation: name, category, brand are required
    if (!name || name.trim() === "") {
      throw new ApiError(400, "Product name is required");
    }
    if (!category) {
      throw new ApiError(400, "Product category is required");
    }
    if (!brand) {
      throw new ApiError(400, "Product brand is required");
    }

    // 3. Generate normalized slug (priority: slug > name)
    const normalizedSlug = slug
      ? slugify(slug, { lower: true, trim: true })
      : slugify(name, { lower: true, trim: true });

    // 4. Existing Product Check
    const productExists = await Product.findOne({ slug: normalizedSlug });
    if (productExists) {
      throw new ApiError(400, "Product already exists");
    }

    // 5. Normalize + Validate categories
    const parsedCategory = normalizeAndValidateCategories(category);

    // variants parsing
    let parsedVariants;

    try {
      parsedVariants = typeof variants === "string"
        ? JSON.parse(variants)
        : variants;
    } catch (error) {
      throw new ApiError(400, "Invalid variants format");
    }

    // loop through variants to validate and set default images
    parsedVariants = parsedVariants.map((variant, index) => {
      // 1. SKU
      if (!variant.sku || variant.sku.trim() === "") {
        throw new ApiError(400, `Variant ${index + 1}: SKU is required`);
      }

      // 2. Color
      if (!variant.color) {
        throw new ApiError(400, `Variant ${index + 1}: Color is required`);
      }

      // 3. Stock
      if (variant.stock === undefined || variant.stock < 0) {
        throw new ApiError(400, `Variant ${index + 1}: Valid stock is required`);
      }

      // 4. Price
      if (variant.original_price === undefined || variant.original_price < 0) {
        throw new ApiError(400, `Variant ${index + 1}: Valid original price is required`);
      }

      // 5. Normalize attributes (optional but clean)
      const normalizedAttributes =
        variant.attributes && typeof variant.attributes === "object"
          ? variant.attributes
          : {};

      // 6. Default images (VERY IMPORTANT)
      return {
        ...variant,
        attributes: normalizedAttributes,

        featuredImage: variant.featuredImage || {
          url: DEFAULT_PRODUCT_IMAGE,
          public_id: null,
        },

        galleryImages: variant.galleryImages?.length
          ? variant.galleryImages
          : [
            {
              url: DEFAULT_PRODUCT_IMAGE,
              public_id: null,
            },
          ],
      };
    });


  }



  catch (error) {
    console.error("Create product error:", error);
    throw error
  }
}