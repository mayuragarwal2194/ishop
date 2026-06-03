import { createCouponService, deleteCouponService, getCouponByIdService, getCouponsService, updateCouponService, validateCouponService } from "../services/coupon.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";




export const createCoupon = asyncHandler(async (req, res) => {
  const result = await createCouponService(
    req.validatedData,
    req.user
  );

  return ApiResponse(
    res,
    201,
    "Coupon created successfully",
    result
  );
});

export const getCoupons = asyncHandler(async (req, res) => {
  const result = await getCouponsService(
    req.query
  );

  return ApiResponse(
    res,
    200,
    "Coupons fetched successfully",
    result
  );
});

export const getCouponById = asyncHandler(async (req, res) => {
  const result = await getCouponByIdService(
    req.params.id
  );

  return ApiResponse(
    res,
    200,
    "Coupon fetched successfully",
    result
  );
});

export const updateCoupon = asyncHandler(async (req, res) => {
  const result = await updateCouponService(
    req.params.id,
    req.validatedData
  );

  return ApiResponse(
    res,
    200,
    "Coupon updated successfully",
    result
  );
});

export const deleteCoupon = asyncHandler(async (req, res) => {
  const result = await deleteCouponService(
    req.params.id
  );

  return ApiResponse(
    res,
    200,
    "Coupon deactivated successfully",
    result
  );
});

export const validateCoupon = asyncHandler(async (req, res) => {
  const result = await validateCouponService(
    req.user._id,
    req.validatedData.code
  );

  return ApiResponse(
    res,
    200,
    "Coupon validated successfully",
    result
  );
});