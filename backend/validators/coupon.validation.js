import { z } from "zod";

const discountTypes = ["percentage", "fixed"];

export const createCouponSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Coupon code is required")
    .max(50, "Coupon code cannot exceed 50 characters"),

  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),

  discountType: z.enum(discountTypes, {
    message: "Discount type must be either percentage or fixed",
  }),

  discountValue: z.coerce
    .number()
    .min(1, "Discount value must be greater than 0"),

  minimumOrderAmount: z.coerce
    .number()
    .min(0, "Minimum order amount cannot be negative")
    .optional(),

  maximumDiscountAmount: z.coerce
    .number()
    .min(1, "Maximum discount amount must be greater than 0")
    .nullable()
    .optional(),

  usageLimit: z.coerce
    .number()
    .int("Usage limit must be an integer")
    .min(1, "Usage limit must be greater than 0")
    .nullable()
    .optional(),

  usagePerUser: z.coerce
    .number()
    .int("Usage per user must be an integer")
    .min(1, "Usage per user must be greater than 0")
    .optional(),

  validFrom: z.coerce.date({
    message: "Valid from date is required",
  }),

  validUntil: z.coerce.date({
    message: "Valid until date is required",
  }),

  isActive: z.boolean().optional(),
}).refine(
  (data) => data.validUntil > data.validFrom,
  {
    path: ["validUntil"],
    message: "Valid until date must be after valid from date",
  }
).refine(
  (data) =>
    data.discountType !== "percentage" ||
    data.discountValue <= 100,
  {
    path: ["discountValue"],
    message: "Percentage discount cannot exceed 100",
  }
);

export const updateCouponSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Coupon code cannot be empty")
    .max(50, "Coupon code cannot exceed 50 characters")
    .optional(),

  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),

  discountType: z
    .enum(discountTypes, {
      message: "Discount type must be either percentage or fixed",
    })
    .optional(),

  discountValue: z.coerce
    .number()
    .min(1, "Discount value must be greater than 0")
    .optional(),

  minimumOrderAmount: z.coerce
    .number()
    .min(0, "Minimum order amount cannot be negative")
    .optional(),

  maximumDiscountAmount: z.coerce
    .number()
    .min(1, "Maximum discount amount must be greater than 0")
    .nullable()
    .optional(),

  usageLimit: z.coerce
    .number()
    .int("Usage limit must be an integer")
    .min(1, "Usage limit must be greater than 0")
    .nullable()
    .optional(),

  usagePerUser: z.coerce
    .number()
    .int("Usage per user must be an integer")
    .min(1, "Usage per user must be greater than 0")
    .optional(),

  validFrom: z.coerce.date().optional(),

  validUntil: z.coerce.date().optional(),

  isActive: z.boolean().optional(),
}).refine(
  (data) => {
    if (data.validFrom && data.validUntil) {
      return data.validUntil > data.validFrom;
    }
    return true;
  },
  {
    path: ["validUntil"],
    message: "Valid until date must be after valid from date",
  }
).refine(
  (data) => {
    if (
      data.discountType === "percentage" &&
      data.discountValue !== undefined
    ) {
      return data.discountValue <= 100;
    }
    return true;
  },
  {
    path: ["discountValue"],
    message: "Percentage discount cannot exceed 100",
  }
);

export const validateCouponSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Coupon code is required")
    .max(50, "Coupon code cannot exceed 50 characters"),
});