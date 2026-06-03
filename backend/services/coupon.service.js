import Coupon from "../models/coupon.model.js";
import CouponUsage from "../models/couponUsage.model.js";
import { ApiError } from "../utils/ApiError.js";
import { buildSearchQuery } from "../utils/search.js";
import { buildSortQuery } from "../utils/buildSortQuery.js";
import { getPagination } from "../utils/pagination.js";
import { validateObjectId } from "../utils/validateObjectId.js";
import { parseBoolean } from "../helper/parseBoolean.helper.js";
import { getCartService } from "./cart.service.js";





export const createCouponService = async (couponData, currentUser) => {

  const couponCode = couponData.code.toUpperCase();

  // Check if coupon code already exists
  const existingCoupon = await Coupon.findOne({
    code: couponCode,
  });

  if (existingCoupon) {
    throw new ApiError(400, "Coupon code already exists");
  }

  // Create coupon
  const coupon = new Coupon({
    ...couponData,
    code: couponCode,
    createdBy: currentUser._id,
  });

  await coupon.save();

  return coupon;
};

export const getCouponsService = async (queryParams) => {
  const filter = {};

  // Active status filter
  if (queryParams.isActive !== undefined) {
    filter.isActive = parseBoolean(queryParams.isActive);
  }

  // Discount type filter
  if (queryParams.discountType) {
    filter.discountType = queryParams.discountType;
  }

  // Search filter
  const searchQuery = buildSearchQuery(queryParams.search, ["code", "description"]);

  // Combine filters and search
  const finalFilter = { ...filter, ...searchQuery, };

  // Pagination
  const { page, limit, skip } = getPagination(queryParams);

  // Sorting
  const sortQuery = buildSortQuery(queryParams.sort);

  const totalCoupons = await Coupon.countDocuments(finalFilter);

  const totalPages = Math.ceil(totalCoupons / limit);

  const coupons = await Coupon.find(finalFilter)
    .sort(sortQuery)
    .skip(skip)
    .limit(limit)
    .populate(
      "createdBy",
      "name email role"
    );

  return {
    coupons,
    pagination: {
      total: totalCoupons,
      page,
      limit,
      totalPages,
    },
  };
};

export const getCouponByIdService = async (couponId) => {

  // Validate coupon ID
  const validCouponId = validateObjectId(couponId, "Coupon");

  // Find coupon by ID
  const coupon = await Coupon.findById(validCouponId).populate(
    "createdBy",
    "name email role"
  );

  // Check if coupon exists
  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  return coupon;
};

export const updateCouponService = async (couponId, updateData) => {

  // Validate coupon ID
  const validCouponId = validateObjectId(couponId, "Coupon");

  // Find coupon
  const coupon = await Coupon.findById(validCouponId);

  // Check if coupon exists
  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  // Prevent modification of core fields once coupon has been used
  if (coupon.usedCount > 0) {

    const lockedFields = [
      "code",
      "discountType",
      "discountValue",
      "minimumOrderAmount",
      "maximumDiscountAmount",
      "usagePerUser",
      "usageLimit"
    ];

    const isTryingToUpdateLockedField =
      lockedFields.some((field) => updateData[field] !== undefined);

    if (isTryingToUpdateLockedField) {
      throw new ApiError(400, "Discount configuration cannot be modified once a coupon has been used");
    }
  }

  // Check code uniqueness if code is being updated
  if (updateData.code && updateData.code.toUpperCase() !== coupon.code) {

    const existingCoupon = await Coupon.findOne({
      code: updateData.code.toUpperCase(),
      _id: { $ne: coupon._id },
    });

    if (existingCoupon) {
      throw new ApiError(400, "Coupon code already exists");
    }
  }

  // Apply updates
  Object.assign(coupon, updateData);

  // Save updated coupon
  await coupon.save();

  return coupon;
};

export const deleteCouponService = async (couponId) => {

  // Validate coupon ID
  const validCouponId = validateObjectId(couponId, "Coupon");

  // Find coupon
  const coupon = await Coupon.findById(validCouponId);

  // Check if coupon exists
  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  // Check if coupon is already inactive
  if (!coupon.isActive) {
    throw new ApiError(400, "Coupon is already inactive");
  }

  // Deactivate coupon
  coupon.isActive = false;

  // Save coupon
  await coupon.save();

  return coupon;
};

export const validateCouponService = async (userId, code) => {

  // Find coupon
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), });

  // Check if coupon exists
  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  // Check if coupon is active
  if (!coupon.isActive) {
    throw new ApiError(400, "Coupon is inactive");
  }

  const now = new Date();

  // Check if coupon has started
  if (coupon.validFrom > now) {
    throw new ApiError(400, "Coupon is not active yet");
  }

  // Check if coupon has expired
  if (coupon.validUntil < now) {
    throw new ApiError(400, "Coupon has expired");
  }

  // Check global usage limit
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    throw new ApiError(400, "Coupon usage limit reached");
  }

  // Check per-user usage limit
  const couponUsage = await CouponUsage.findOne({
    coupon: coupon._id,
    user: userId,
  });

  if (couponUsage && couponUsage.usedCount >= coupon.usagePerUser) {
    throw new ApiError(400, "Coupon usage limit reached for this user");
  }

  // Get cart details
  const cart = await getCartService(userId);

  // Check if cart is empty
  if (!cart.items.length) {
    throw new ApiError(400, "Cart is empty");
  }

  // Check if cart contains unavailable items
  if (cart.hasIssues) {
    throw new ApiError(400, "Cart contains unavailable items");
  }

  // Check minimum order amount
  if (cart.grandTotal < coupon.minimumOrderAmount) {
    throw new ApiError(
      400,
      `Minimum order amount of ₹${coupon.minimumOrderAmount} is required to use this coupon`
    );
  }

  let discountAmount = 0;

  // Percentage discount
  if (coupon.discountType === "percentage") {
    discountAmount = (cart.grandTotal * coupon.discountValue) / 100;

    // Apply max discount cap if configured
    if (coupon.maximumDiscountAmount !== null) {
      discountAmount = Math.min(discountAmount, coupon.maximumDiscountAmount);
    }
  }

  // Fixed discount
  if (coupon.discountType === "fixed") {
    discountAmount = coupon.discountValue;
  }

  // Prevent discount exceeding cart total
  discountAmount = Math.min(discountAmount, cart.grandTotal);

  discountAmount = Number(discountAmount.toFixed(2));

  const finalAmount = cart.grandTotal - discountAmount;

  return {
    coupon: coupon._id,
    code: coupon.code,

    discountType:
      coupon.discountType,

    discountValue:
      coupon.discountValue,

    originalAmount:
      cart.grandTotal,

    discountAmount,

    finalAmount,
  };
};