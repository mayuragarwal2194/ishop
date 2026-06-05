import { z } from "zod";

export const createRazorpayOrderSchema = z.object({
  orderId: z
    .string()
    .trim()
    .min(1, "Order ID is required"),
});

export const verifyRazorpayPaymentSchema = z.object({
  razorpayOrderId: z
    .string()
    .trim()
    .min(1, "Razorpay order ID is required"),

  razorpayPaymentId: z
    .string()
    .trim()
    .min(1, "Razorpay payment ID is required"),

  razorpaySignature: z
    .string()
    .trim()
    .min(1, "Razorpay signature is required"),
});

export const handleRazorpayFailureSchema = z.object({
  razorpayOrderId: z
    .string()
    .trim()
    .min(1, "Razorpay order ID is required"),

  razorpayPaymentId: z
    .string()
    .trim()
    .optional(),
});