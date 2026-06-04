import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { cancelOrderService, createOrderService, getAllOrdersService, getMyOrdersService, getOrderByIdService, updateOrderStatusService, updatePaymentStatusService } from "../services/order.service.js";




export const createOrder = asyncHandler(async (req, res) => {

  const result = await createOrderService(
    req.user._id,
    req.validatedData
  );

  return ApiResponse(
    res,
    201,
    "Order placed successfully",
    result
  );
});

export const getMyOrders = asyncHandler(async (req, res) => {

  const result = await getMyOrdersService(
    req.user._id,
    req.query
  );

  return ApiResponse(
    res,
    200,
    "Orders fetched successfully",
    result
  );
});

export const getOrderById = asyncHandler(async (req, res) => {

  const result = await getOrderByIdService(
    req.params.id,
    req.user
  );

  return ApiResponse(
    res,
    200,
    "Order fetched successfully",
    result
  );
});

export const cancelOrder = asyncHandler(async (req, res) => {

  const result = await cancelOrderService(
    req.params.id,
    req.user
  );

  return ApiResponse(
    res,
    200,
    "Order cancelled successfully",
    result
  );
});

export const getAllOrders = asyncHandler(async (req, res) => {

  const result = await getAllOrdersService(
    req.query
  );

  return ApiResponse(
    res,
    200,
    "Orders fetched successfully",
    result
  );
});

export const updateOrderStatus = asyncHandler(async (req, res) => {

  const result = await updateOrderStatusService(
    req.params.id,
    req.validatedData.orderStatus
  );

  return ApiResponse(
    res,
    200,
    "Order status updated successfully",
    result
  );
});

export const updatePaymentStatus = asyncHandler(async (req, res) => {

  const result = await updatePaymentStatusService(
    req.params.id,
    req.validatedData.paymentStatus
  );

  return ApiResponse(
    res,
    200,
    "Payment status updated successfully",
    result
  );
});