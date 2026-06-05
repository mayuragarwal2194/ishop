import { z } from "zod";

const reviewStatus = ["pending", "approved", "rejected"];

export const createReviewSchema = z.object({
  productId: z
    .string()
    .trim()
    .min(1, "Product ID is required"),

  orderId: z
    .string()
    .trim()
    .min(1, "Order ID is required"),

  variantId: z
    .string()
    .trim()
    .optional()
    .nullable(),

  rating: z.coerce
    .number()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot be more than 5"),

  title: z
    .string()
    .trim()
    .max(120, "Title cannot exceed 120 characters")
    .optional(),

  comment: z
    .string()
    .trim()
    .max(2000, "Comment cannot exceed 2000 characters")
    .optional(),
});

export const updateReviewSchema = z.object({
  rating: z.coerce
    .number()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot be more than 5")
    .optional(),

  title: z
    .string()
    .trim()
    .max(120, "Title cannot exceed 120 characters")
    .optional(),

  comment: z
    .string()
    .trim()
    .max(2000, "Comment cannot exceed 2000 characters")
    .optional(),
});

export const updateReviewStatusSchema = z.object({
  status: z.enum(reviewStatus, {
    message: "Status must be pending, approved, or rejected",
  }),
});

export const adminReplyReviewSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Reply message is required")
    .max(1000, "Reply message cannot exceed 1000 characters"),
});