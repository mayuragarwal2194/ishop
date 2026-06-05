import {
  createReviewService,
  updateReviewService,
  deleteReviewService,
  getProductReviewsService,
  getReviewByIdService,
  getMyReviewsService,
  getAllReviewsService,
  updateReviewStatusService,
  adminReplyReviewService,
  deleteAdminReplyReviewService,
} from "../services/review.service.js";

import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";



export const createReview = asyncHandler(async (req, res) => {
  const review = await createReviewService(
    req.user._id,
    req.validatedData
  );

  return ApiResponse(
    res,
    201,
    "Review created successfully",
    review
  );
});

export const updateReview = asyncHandler(async (req, res) => {
  const review = await updateReviewService(
    req.user._id,
    req.params.id,
    req.validatedData
  );

  return ApiResponse(
    res,
    200,
    "Review updated successfully",
    review
  );
});

export const deleteReview = asyncHandler(async (req, res) => {
  await deleteReviewService(
    req.user._id,
    req.params.id
  );

  return ApiResponse(
    res,
    200,
    "Review deleted successfully",
    null
  );
});

export const getProductReviews = asyncHandler(async (req, res) => {
  const result = await getProductReviewsService(
    req.params.productId,
    req.query
  );

  return ApiResponse(
    res,
    200,
    "Product reviews fetched successfully",
    result
  );
});

export const getReviewById = asyncHandler(async (req, res) => {
  const review = await getReviewByIdService(
    req.params.id
  );

  return ApiResponse(
    res,
    200,
    "Review fetched successfully",
    review
  );
});

export const getMyReviews = asyncHandler(async (req, res) => {
  const result = await getMyReviewsService(
    req.user._id,
    req.query
  );

  return ApiResponse(
    res,
    200,
    "Reviews fetched successfully",
    result
  );
});



// Admin Specific

export const getAllReviews = asyncHandler(async (req, res) => {
  const result = await getAllReviewsService(req.query);

  return ApiResponse(
    res,
    200,
    "Reviews fetched successfully",
    result
  );
});

export const updateReviewStatus = asyncHandler(async (req, res) => {
  const review = await updateReviewStatusService(
    req.params.id,
    req.validatedData.status
  );

  return ApiResponse(
    res,
    200,
    "Review status updated successfully",
    review
  );
});

export const adminReplyReview = asyncHandler(async (req, res) => {
  const review = await adminReplyReviewService(
    req.user._id,
    req.params.id,
    req.validatedData.message
  );

  return ApiResponse(
    res,
    200,
    "Admin reply added successfully",
    review
  );
});

export const deleteAdminReplyReview = asyncHandler(async (req, res) => {
  const review = await deleteAdminReplyReviewService(
    req.params.id
  );

  return ApiResponse(
    res,
    200,
    "Admin reply deleted successfully",
    review
  );
});