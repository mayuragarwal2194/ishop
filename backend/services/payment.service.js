import crypto from "crypto";
import mongoose from "mongoose";

import Payment from "../models/payment.model.js";
import Order from "../models/order/order.model.js";

import { razorpayInstance } from "../config/razorpay.config.js";
import { ApiError } from "../utils/ApiError.js";
import { validateObjectId } from "../utils/validateObjectId.js";


export const createRazorpayOrderService = async (userId, orderId) => {
  // 1. Validate order ID
  const validOrderId = validateObjectId(orderId, "Order");

  // 2. Find order
  const order = await Order.findOne({ _id: validOrderId, user: userId, });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // 3. Validate payment method
  if (order.paymentMethod !== "razorpay") {
    throw new ApiError(400, "This order is not a Razorpay order");
  }

  // 4. Prevent duplicate paid payment
  if (order.paymentStatus === "paid") {
    throw new ApiError(400, "Payment is already completed for this order");
  }

  // 5. Prevent payment for cancelled order
  if (order.orderStatus === "cancelled") {
    throw new ApiError(400, "Cannot create payment for a cancelled order");
  }

  // 6. Check if Razorpay order already exists
  const existingPayment = await Payment.findOne({
    order: order._id,
    status: { $in: ["created"] },
  });

  if (existingPayment) {
    return {
      payment: existingPayment,
      razorpayOrder: {
        id: existingPayment.razorpayOrderId,
        amount: existingPayment.amount * 100,
        currency: existingPayment.currency,
      },
      key: process.env.RAZORPAY_KEY_ID,
    };
  }

  // 7. Razorpay amount must be in paise
  const amountInPaise = Math.round(order.pricing.grandTotal * 100);

  // 8. Create Razorpay order
  const razorpayOrder = await razorpayInstance.orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt: order.orderNumber,
    notes: {
      internalOrderId: order._id.toString(),
      orderNumber: order.orderNumber,
      userId: userId.toString(),
    },
  });

  // 9. Create internal payment record
  const payment = new Payment({
    order: order._id,
    user: userId,
    provider: "razorpay",
    paymentMethod: "razorpay",
    amount: order.pricing.grandTotal,
    currency: "INR",
    status: "created",
    razorpayOrderId: razorpayOrder.id,
  });

  // 10 Save payment record
  await payment.save();

  // 11. Return data needed by frontend checkout
  return {
    payment,
    razorpayOrder,
    key: process.env.RAZORPAY_KEY_ID,
  };
};

export const verifyRazorpayPaymentService = async (
  userId,
  {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  }
) => {

  // Start Session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Find payment record
    const payment = await Payment.findOne({
      razorpayOrderId: razorpayOrderId,
      user: userId,
    }).session(session);

    if (!payment) {
      throw new ApiError(404, "Payment record not found");
    }

    // 2. Prevent duplicate verification
    if (payment.status === "paid") {
      throw new ApiError(400, "Payment already verified");
    }

    // 3. Generate expected signature
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    // 4. Compare signatures
    if (expectedSignature !== razorpaySignature) {
      throw new ApiError(400, "Invalid payment signature");
    }

    // 5. Mark payment as paid
    payment.status = "paid";
    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    payment.paidAt = new Date();

    await payment.save({
      session,
      validateBeforeSave: false,
    });

    // 6. Find related order
    const order = await Order.findById(payment.order).session(session);

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    // 7. Mark order payment as paid
    order.paymentStatus = "paid";

    // 8. Auto-confirm order after successful Razorpay payment
    if (order.orderStatus === "pending") {
      order.orderStatus = "confirmed";
    }

    await order.save({
      session,
      validateBeforeSave: false,
    });

    // 9. Commit transaction
    await session.commitTransaction();

    // 10. Return updated data
    return {
      payment,
      order,
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const handleRazorpayFailureService = async (
  razorpayOrderId,
  razorpayPaymentId = null
) => {

  // Find payment
  const payment = await Payment.findOne({ razorpayOrderId });

  if (!payment) {
    throw new ApiError(404, "Payment not found");
  }

  // Already processed
  if (payment.status === "paid") {
    throw new ApiError(400, "Payment already completed successfully");
  }

  // Update payment
  payment.status = "failed";

  if (razorpayPaymentId) {
    payment.razorpayPaymentId = razorpayPaymentId;
  }

  await payment.save();

  return payment;
};

export const getMyPaymentsService = async (userId) => {
  const payments = await Payment.find({ user: userId })
    .populate("order", "orderNumber orderStatus paymentStatus pricing")
    .sort({ createdAt: -1 });

  return payments;
};

export const getPaymentByIdService = async (user, paymentId) => {

  // Validate Payment id 
  const validPaymentId = validateObjectId(paymentId, "Payment");

  const payment = await Payment.findById(validPaymentId)
    .populate("user", "name email")
    .populate("order", "orderNumber orderStatus paymentStatus pricing");

  if (!payment) {
    throw new ApiError(404, "Payment not found");
  }

  const isOwner = payment.user._id.toString() === user._id.toString();
  const isAdmin = ["admin", "superAdmin"].includes(user.role);

  if (!isOwner && !isAdmin) {
    throw new ApiError(403, "You are not allowed to view this payment");
  }

  return payment;
};

export const getAllPaymentsService = async () => {
  const payments = await Payment.find()
    .populate("user", "name email role")
    .populate("order", "orderNumber orderStatus paymentStatus pricing")
    .sort({ createdAt: -1 });

  return payments;
};

export const getPaymentsByUserIdService = async (userId) => {
  const validUserId = validateObjectId(userId, "User");

  const payments = await Payment.find({ user: validUserId })
    .populate("user", "name email role")
    .populate("order", "orderNumber orderStatus paymentStatus pricing")
    .sort({ createdAt: -1 });

  return payments;
};