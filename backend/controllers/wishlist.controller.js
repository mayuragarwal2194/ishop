import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import {
  addToWishlistService,
  getWishlistService,
  removeFromWishlistService,
  clearWishlistService,
} from "../services/wishlist.service.js";


export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId, variantId } = req.validatedData;

  const result = await addToWishlistService(
    req.user._id,
    productId,
    variantId
  );

  return ApiResponse(
    res,
    201,
    "Product added to wishlist successfully",
    result
  );
});

export const getWishlist = asyncHandler(async (req, res) => {
  const result = await getWishlistService(req.user._id);

  return ApiResponse(
    res,
    200,
    "Wishlist fetched successfully",
    result
  );
});

export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId, variantId } = req.validatedData;

  const result = await removeFromWishlistService(
    req.user._id,
    productId,
    variantId
  );

  return ApiResponse(
    res,
    200,
    "Product removed from wishlist successfully",
    result
  );
});

export const clearWishlist = asyncHandler(async (req, res) => {
  const result = await clearWishlistService(req.user._id);

  return ApiResponse(
    res,
    200,
    "Wishlist cleared successfully",
    result
  );
});