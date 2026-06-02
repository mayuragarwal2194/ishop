import { addToCartService, clearCartService, getCartService, removeCartItemService, updateCartItemService } from "../services/cart.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


export const addToCart = asyncHandler(async (req, res) => {

  const result = await addToCartService(
    req.user._id,
    req.validatedData.productId,
    req.validatedData.variantId,
    req.validatedData.quantity
  );

  return ApiResponse(
    res,
    200,
    "Item added to cart successfully",
    result
  );
});

export const getCart = asyncHandler(async (req, res) => {
  const result = await getCartService(req.user._id);

  return ApiResponse(
    res,
    200,  
    "Cart fetched successfully",
    result
  );
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const result = await updateCartItemService(
    req.user._id,
    req.params.variantId,
    req.validatedData.quantity
  );

  return ApiResponse(
    res,
    200,
    "Cart item updated successfully",
    result
  );
});

export const removeCartItem = asyncHandler(async (req,res) => {
  const result = await removeCartItemService(
    req.user._id,
    req.params.variantId
  );

  return ApiResponse(
    res,
    200,
    "Item removed from cart successfully",
    result
  );
});

export const clearCart = asyncHandler(async (req, res) => {
  const result = await clearCartService(
    req.user._id
  );

  return ApiResponse(
    res,
    200,
    "Cart cleared successfully",
    result
  );
});