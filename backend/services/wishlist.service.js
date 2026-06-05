import Wishlist from "../models/wishlist.model.js";
import Product from "../models/product.model.js";

import { ApiError } from "../utils/ApiError.js";
import { validateObjectId } from "../utils/validateObjectId.js";

export const addToWishlistService = async (userId, productId, variantId) => {
  // Validate IDs
  const validUserId = validateObjectId(userId, "User");
  const validProductId = validateObjectId(productId, "Product");
  const validVariantId = validateObjectId(variantId, "Variant");

  // Find product
  const product = await Product.findById(validProductId);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Check variant exists in product
  const variant = product.variants.id(validVariantId);

  if (!variant) {
    throw new ApiError(404, "Variant not found in this product");
  }

  // Find or create wishlist
  let wishlist = await Wishlist.findOne({ user: validUserId });

  if (!wishlist) {
    wishlist = new Wishlist({
      user: validUserId,
      items: [],
    });
  }

  // Prevent duplicate item
  const itemAlreadyExists = wishlist.items.some(
    (item) =>
      item.product.toString() === validProductId.toString() &&
      item.variant.toString() === validVariantId.toString()
  );

  if (itemAlreadyExists) {
    throw new ApiError(400, "Product already exists in wishlist");
  }

  // Add item
  wishlist.items.push({
    product: validProductId,
    variant: validVariantId,
  });

  await wishlist.save();

  return wishlist;
};

export const getWishlistService = async (userId) => {
  const validUserId = validateObjectId(userId, "User");

  const wishlist = await Wishlist.findOne({ user: validUserId }).populate({
    path: "items.product",
    select: "name slug images variants",
  });

  if (!wishlist) {
    return {
      user: validUserId,
      items: [],
    };
  }

  return wishlist;
};

export const removeFromWishlistService = async (userId, productId, variantId) => {
  // Validate IDs
  const validUserId = validateObjectId(userId, "User");
  const validProductId = validateObjectId(productId, "Product");
  const validVariantId = validateObjectId(variantId, "Variant");

  // Find wishlist
  const wishlist = await Wishlist.findOne({ user: validUserId });

  if (!wishlist) {
    throw new ApiError(404, "Wishlist not found");
  }

  // Check item exists
  const itemExists = wishlist.items.some(
    (item) =>
      item.product.toString() === validProductId.toString() &&
      item.variant.toString() === validVariantId.toString()
  );

  if (!itemExists) {
    throw new ApiError(404, "Product not found in wishlist");
  }

  // Remove item
  wishlist.items = wishlist.items.filter((item) => {
    const isTargetItem =
      item.product.toString() === validProductId.toString() &&
      item.variant.toString() === validVariantId.toString();

    return !isTargetItem;
  });

  await wishlist.save();

  return wishlist;
};

export const clearWishlistService = async (userId) => {
  const validUserId = validateObjectId(userId, "User");

  const wishlist = await Wishlist.findOne({ user: validUserId });

  if (!wishlist) {
    throw new ApiError(404, "Wishlist not found");
  }

  wishlist.items = [];

  await wishlist.save();

  return wishlist;
};