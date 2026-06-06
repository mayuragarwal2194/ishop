import Review from "../models/review.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order/order.model.js";
import User from "../models/user.model.js";

import { ApiError } from "../utils/ApiError.js";
import { validateObjectId } from "../utils/validateObjectId.js";
import { getPagination } from "../utils/pagination.js";
import { buildSearchQuery } from "../utils/search.js";
import { buildSortQuery } from "../utils/buildSortQuery.js";
import { parseBoolean } from "../helper/parseBoolean.helper.js";
import { createNotificationService } from "./notification.service.js";
import { sendEmail } from "../utils/auth_utils/sendEmail.js";
import { reviewNotificationTemplate } from "../utils/email_templates/reviewNotificationTemplate.js";


export const createReviewService = async (userId, payload) => {
  const { productId, orderId, variantId, rating, title, comment } = payload;

  const validUserId = validateObjectId(userId, "User");
  const validProductId = validateObjectId(productId, "Product");
  const validOrderId = validateObjectId(orderId, "Order");

  let validVariantId = null;

  if (variantId) {
    validVariantId = validateObjectId(variantId, "Variant");
  }

  const product = await Product.findById(validProductId);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (validVariantId) {
    const variantExists = product.variants.some(
      (variant) => variant._id.toString() === validVariantId.toString()
    );

    if (!variantExists) {
      throw new ApiError(404, "Variant not found in this product");
    }
  }

  const order = await Order.findById(validOrderId);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.user.toString() !== validUserId.toString()) {
    throw new ApiError(403, "You cannot review using another user's order");
  }

  if (order.orderStatus !== "delivered") {
    throw new ApiError(400, "You can review only after order is delivered");
  }

  const purchasedItem = order.orderItems.find((item) => {
    const sameProduct = item.product.toString() === validProductId.toString();

    const sameVariant = validVariantId
      ? item.variant?.toString() === validVariantId.toString()
      : true;

    return sameProduct && sameVariant;
  });

  if (!purchasedItem) {
    throw new ApiError(400, "This product was not found in the selected order");
  }

  const reviewVariantId = validVariantId || purchasedItem.variant || null;

  const existingReview = await Review.findOne({
    user: validUserId,
    product: validProductId,
    order: validOrderId,
  });

  if (existingReview) {
    throw new ApiError(400, "You have already reviewed this product for this order");
  }

  const review = await Review.create({
    user: validUserId,
    product: validProductId,
    variant: reviewVariantId,
    order: validOrderId,
    rating,
    title,
    comment,
    isVerifiedPurchase: true,
  });

  return review;
};

export const updateReviewService = async (userId, reviewId, payload) => {
  const { rating, title, comment } = payload;

  const validUserId = validateObjectId(userId, "User");
  const validReviewId = validateObjectId(reviewId, "Review");

  const review = await Review.findById(validReviewId);

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  if (review.user.toString() !== validUserId.toString()) {
    throw new ApiError(403, "You can update only your own review");
  }

  if (rating !== undefined) review.rating = rating;
  if (title !== undefined) review.title = title;
  if (comment !== undefined) review.comment = comment;

  await review.save();

  return review;
};

export const deleteReviewService = async (userId, reviewId) => {
  const validUserId = validateObjectId(userId, "User");
  const validReviewId = validateObjectId(reviewId, "Review");

  const review = await Review.findById(validReviewId);

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  if (review.user.toString() !== validUserId.toString()) {
    throw new ApiError(403, "You can delete only your own review");
  }

  await review.deleteOne();

  return null;
};

export const getProductReviewsService = async (productId, queryParams = {}) => {
  const validProductId = validateObjectId(productId, "Product");

  const { page, limit, skip } = getPagination(queryParams);

  const { sort } = queryParams;

  const sortQuery = buildSortQuery(sort, {
    helpful: { helpfulCount: -1 },
    rating_high: { rating: -1 },
    rating_low: { rating: 1 },
  });

  const filter = {
    product: validProductId,
    status: "approved",
  };

  const [reviews, totalReviews] = await Promise.all([
    Review.find(filter)
      .populate("user", "name avatar")
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .lean(),

    Review.countDocuments(filter),
  ]);

  return {
    reviews,
    pagination: {
      total: totalReviews,
      page,
      limit,
      totalPages: Math.ceil(totalReviews / limit),
    },
  };
};

export const getReviewByIdService = async (reviewId) => {
  const validReviewId = validateObjectId(reviewId, "Review");

  const review = await Review.findById(validReviewId)
    .populate("user", "name email avatar")
    .populate("product", "name featuredImage slug")
    .populate("order", "orderNumber orderStatus")
    .lean();

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  return review;
};

export const getMyReviewsService = async (userId, queryParams = {}) => {
  const validUserId = validateObjectId(userId, "User");

  const { page, limit, skip } = getPagination(queryParams);

  const { search, sort } = queryParams;

  const searchQuery = buildSearchQuery(search, ["title", "comment"]);

  const filter = {
    user: validUserId,
    ...searchQuery,
  };

  const sortQuery = buildSortQuery(sort, {
    rating_high: { rating: -1 },
    rating_low: { rating: 1 },
  });

  const [reviews, totalReviews] = await Promise.all([
    Review.find(filter)
      .populate("product", "name featuredImage slug")
      .populate("order", "orderNumber orderStatus")
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .lean(),

    Review.countDocuments(filter),
  ]);

  return {
    reviews,
    pagination: {
      total: totalReviews,
      page,
      limit,
      totalPages: Math.ceil(totalReviews / limit),
    },
  };
};



// ADMIN SPECIFIC SERVICES
export const getAllReviewsService = async (queryParams = {}) => {
  const filter = {};

  const {
    status,
    rating,
    product,
    user,
    isVerifiedPurchase,
    search,
    sort,
  } = queryParams;

  const { page, limit, skip } = getPagination(queryParams);

  if (status) {
    filter.status = status;
  }

  if (rating) {
    filter.rating = Number(rating);
  }

  if (product) {
    filter.product = validateObjectId(product, "Product");
  }

  if (user) {
    filter.user = validateObjectId(user, "User");
  }

  if (isVerifiedPurchase !== undefined) {
    filter.isVerifiedPurchase = parseBoolean(isVerifiedPurchase);
  }

  const searchQuery = buildSearchQuery(search, ["title", "comment"]);

  const finalFilter = {
    ...filter,
    ...searchQuery,
  };

  const sortQuery = buildSortQuery(sort, {
    rating_high: { rating: -1 },
    rating_low: { rating: 1 },
    helpful: { helpfulCount: -1 },
    reported: { reportedCount: -1 },
  });

  const [reviews, totalReviews] = await Promise.all([
    Review.find(finalFilter)
      .populate("user", "name email avatar")
      .populate("product", "name featuredImage slug")
      .populate("order", "orderNumber orderStatus")
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .lean(),

    Review.countDocuments(finalFilter),
  ]);

  return {
    reviews,
    pagination: {
      total: totalReviews,
      page,
      limit,
      totalPages: Math.ceil(totalReviews / limit),
    },
  };
};

export const updateReviewStatusService = async (reviewId, status) => {
  const validReviewId = validateObjectId(reviewId, "Review");

  const review = await Review.findById(validReviewId);

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  if (review.status === status) {
    throw new ApiError(400, `Review is already ${status}`);
  }

  review.status = status;

  await review.save();

  // Create notification
  await createNotificationService({
    user: review.user,
    title: `Review ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    message: `Your review has been ${status}.`,
    type: "review",
    data: {
      reviewId: review._id,
      productId: review.product,
      status,
      redirectTo: `/reviews/${review._id}`,
    },
  });

  // Send Email
  try {
    const user = await User.findById(review.user).select("name email");

    await sendEmail({
      to: user.email,
      subject: `Review ${status}`,
      html: reviewNotificationTemplate(
        user.name,
        `Review ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        `Your review has been ${status}.`
      ),
    });
  } catch (error) {
    console.error(
      "Review status email failed:",
      error.message
    );
  }

  return review;
};

export const adminReplyReviewService = async (adminId, reviewId, message) => {
  const validAdminId = validateObjectId(adminId, "Admin");
  const validReviewId = validateObjectId(reviewId, "Review");

  const review = await Review.findById(validReviewId);

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  review.adminReply = {
    message,
    repliedBy: validAdminId,
    repliedAt: new Date(),
  };

  await review.save();

  // Create Notification
  await createNotificationService({
    user: review.user,
    title: "Admin Replied to Your Review",
    message: "Admin has replied to your review.",
    type: "review",
    data: {
      reviewId: review._id,
      productId: review.product,
      redirectTo: `/reviews/${review._id}`,
    },
  });

  // Send Email
  try {
    const user = await User.findById(review.user).select("name email");

    await sendEmail({
      to: user.email,
      subject: "Admin Replied to Your Review",
      html: reviewNotificationTemplate(
        user.name,
        "Admin Replied to Your Review",
        "Admin has replied to your review."
      ),
    });
  } catch (error) {
    console.error(
      "Admin reply review email failed:",
      error.message
    );
  }

  return review;
};

export const deleteAdminReplyReviewService = async (reviewId) => {
  const validReviewId = validateObjectId(reviewId, "Review");

  const review = await Review.findById(validReviewId);

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  if (!review.adminReply) {
    throw new ApiError(400, "Review does not have an admin reply");
  }

  review.adminReply = null;

  await review.save();

  return review;
};