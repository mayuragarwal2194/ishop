import Product from "../models/product.model.js";
import Color from "../models/color.model.js";
import { ApiError } from "./ApiError.js";
import { validateObjectId } from "./validateObjectId.js";

export const validateVariants = async (
  variants,
  productId = null // for update case
) => {

  // Basic structure validation
  if (!Array.isArray(variants) || variants.length === 0) {
    throw new ApiError(400, "At least one variant is required");
  }

  for (const variant of variants) {

    // SKU
    if (!variant.sku || variant.sku.trim() === "") {
      throw new ApiError(400, "Variant SKU is required");
    }

    // Color
    if (!variant.color) {
      throw new ApiError(400, "Variant color is required");
    }

    const validColor = validateObjectId(variant.color, "Color");

    const colorExists = await Color.findById(validColor);
    if (!colorExists) {
      throw new ApiError(404, `Color not found: ${variant.color}`);
    }

    // Price
    if (variant.price === undefined) {
      throw new ApiError(400, "Variant price is required");
    }

    // SKU uniqueness
    const existingSku = await Product.findOne({
      "variants.sku": variant.sku,
      ...(productId && { _id: { $ne: productId } })
    });

    if (existingSku) {
      throw new ApiError(
        400,
        `SKU already exists: ${variant.sku}`
      );
    }
  }
};