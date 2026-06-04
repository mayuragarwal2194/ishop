import { z } from "zod";



const paymentMethods = ["cod", "razorpay",];
const orderStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled",];
const paymentStatuses = ["pending", "paid", "failed", "refunded",];


export const createOrderSchema = z.object({
  addressId: z
    .string()
    .trim()
    .min(1, "Address ID is required"),

  paymentMethod: z.enum(
    paymentMethods,
    {
      message: "Payment method must be either cod or razorpay",
    }
  ),

  couponCode: z
    .string()
    .trim()
    .toUpperCase()
    .min(1, "Coupon code cannot be empty")
    .optional(),
});

export const updateOrderStatusSchema = z.object({
  orderStatus: z.enum(
    orderStatuses,
    {
      message: "Invalid order status",
    }
  ),
});

export const updatePaymentStatusSchema = z.object({
  paymentStatus: z.enum(
    paymentStatuses,
    {
      message: "Invalid payment status",
    }
  ),
});

