import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiResponse} from "../utils/ApiResponse.js";

import {
  createRazorpayOrderService,
  verifyRazorpayPaymentService,
  handleRazorpayFailureService,
  getMyPaymentsService,
  getPaymentByIdService,
  getAllPaymentsService,
  getPaymentsByUserIdService,
} from "../services/payment.service.js";



export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const result = await createRazorpayOrderService(
    req.user._id,
    req.body.orderId
  );

  return ApiResponse(
    res,
    201,
    "Razorpay order created successfully",
    result
  );
});

export const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const result = await verifyRazorpayPaymentService(
    req.user._id,
    req.body
  );

  return ApiResponse(
    res,
    200,
    "Payment verified successfully",
    result
  );
});

export const handleRazorpayFailure = asyncHandler(async (req, res) => {
  const result = await handleRazorpayFailureService(
    req.body.razorpayOrderId,
    req.body.razorpayPaymentId
  );

  return ApiResponse(
    res,
    200,
    "Payment failure recorded successfully",
    result
  );
});

export const getMyPayments = asyncHandler(async (req, res) => {
  const payments = await getMyPaymentsService(req.user._id);

  return ApiResponse(
    res,
    200,
    "Payments fetched successfully",
    payments
  );
});

export const getPaymentById = asyncHandler(async (req, res) => {
  const payment = await getPaymentByIdService(
    req.user,
    req.params.paymentId
  );

  return ApiResponse(
    res,
    200,
    "Payment fetched successfully",
    payment
  );
});

export const getAllPayments = asyncHandler(async (req, res) => {
  const payments = await getAllPaymentsService();

  return ApiResponse(
    res,
    200,
    "All payments fetched successfully",
    payments
  );
});

export const getPaymentsByUserId = asyncHandler(async (req, res) => {
  const payments = await getPaymentsByUserIdService(req.params.userId);

  return ApiResponse(
    res,
    200,
    "User payments fetched successfully",
    payments
  );
});