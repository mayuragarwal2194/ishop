import mongoose from "mongoose";
import Order from "../models/order/order.model.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import Address from "../models/address.model.js";
import Coupon from "../models/coupon.model.js";
import CouponUsage from "../models/couponUsage.model.js";
import Counter from "../models/order/counter.model.js";
import User from "../models/user.model.js";

import { ApiError } from "../utils/ApiError.js";
import { validateObjectId } from "../utils/validateObjectId.js";
import { validateCouponService } from "./coupon.service.js";
import { buildSearchQuery } from "../utils/search.js";
import { buildSortQuery } from "../utils/buildSortQuery.js";
import { getPagination } from "../utils/pagination.js";
import { createNotificationService } from "./notification.service.js";
import { sendEmail } from "../utils/auth_utils/sendEmail.js";
import { orderPlacedTemplate } from "../utils/email_templates/orderPlacedTemplate.js";
import { orderStatusTemplate } from "../utils/email_templates/orderStatusTemplate.js";
import { orderCancelledTemplate } from "../utils/email_templates/orderCancelledTemplate.js";


// User Specific Services

export const createOrderService = async (
  userId,
  { addressId, paymentMethod, couponCode }
) => {

  const session = await mongoose.startSession();
  session.startTransaction();

  try {

    // 1. Validate address
    const validAddressId = validateObjectId(addressId, "Address");

    const address = await Address.findOne({
      _id: validAddressId,
      user: userId,
    }).session(session);

    if (!address) {
      throw new ApiError(404, "Address not found");
    }

    // 2. Get cart
    const cart = await Cart.findOne({ user: userId })
      .populate({
        path: "items.product",
        populate: {
          path: "variants.color",
          select: "name",
        },
      })
      .session(session);

    if (!cart || cart.items.length === 0) {
      throw new ApiError(400, "Cart is empty");
    }

    let itemsTotal = 0;
    const orderItems = [];

    // 3. Validate cart
    for (const item of cart.items) {

      const product = item.product;

      if (!product || !product.isActive) {
        throw new ApiError(400, "Invalid product in cart");
      }

      const variant = product.variants.id(item.variant);

      if (!variant) {
        throw new ApiError(400, "Invalid variant in cart");
      }

      if (variant.stock < item.quantity) {
        throw new ApiError(400, `Insufficient stock for ${product.name}`);
      }

      const price = variant.salePrice > 0
        ? variant.salePrice
        : variant.price;

      const subtotal = price * item.quantity;

      itemsTotal += subtotal;

      orderItems.push({
        product: product._id,
        variant: variant._id,
        name: product.name,
        sku: variant.sku,
        color: variant.color?.name.toString(),
        image:
          variant.variantFeaturedImage?.url ||
          product.featuredImage?.url,
        attributes: Object.fromEntries(
          variant.attributes || {}
        ),
        price,
        quantity: item.quantity,
        subtotal,
      });
    }

    // 4. Coupon
    let couponData = null;
    let discount = 0;

    if (couponCode) {
      couponData = await validateCouponService(userId, couponCode);
      discount = couponData.discountAmount;
    }

    // 5. Pricing
    const shippingCharge = 0;

    const grandTotal = Number((itemsTotal - discount + shippingCharge).toFixed(2));

    // 6. Order number
    const counter = await Counter.findOneAndUpdate(
      { name: "order" },
      { $inc: { sequence: 1 } },
      { new: true, upsert: true, session }
    );

    const date = new Date();

    const orderNumber = `ORD-${date.getFullYear()}${String(date.getMonth() + 1)
      .padStart(2, "0")}${String(date.getDate())
        .padStart(2, "0")}-${String(counter.sequence).padStart(4, "0")}`;

    // 7. Create order
    const order = new Order({
      orderNumber,
      user: userId,

      orderItems,

      shippingAddress: {
        fullName: address.fullName,
        phone: address.phone,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        state: address.state,
        country: address.country,
        postalCode: address.postalCode,
        landmark: address.landmark,
      },

      pricing: {
        itemsTotal,
        discount,
        shippingCharge,
        grandTotal,
      },

      coupon: couponData?.coupon || null,
      couponCode: couponData?.code || null,

      paymentMethod,
      paymentStatus: "pending",
      orderStatus: "pending",
      placedAt: new Date(),
    });

    // 8. Stock deduction
    for (const item of cart.items) {
      const product = await Product.findById(item.product).session(session);

      const variant = product.variants.id(item.variant);

      variant.stock -= item.quantity;

      await product.save({
        session,
        validateBeforeSave: false,
      });
    }

    // 9. Coupon usage
    if (couponData) {
      await Coupon.findByIdAndUpdate(
        couponData.coupon,
        { $inc: { usedCount: 1 } },
        { session }
      );

      await CouponUsage.findOneAndUpdate(
        {
          coupon: couponData.coupon,
          user: userId,
        },
        { $inc: { usedCount: 1 } },
        { upsert: true, new: true, session }
      );
    }

    // 10. Clear cart
    cart.items = [];
    await cart.save({ session });

    // 10.5 Save Order
    await order.save({
      session,
      validateBeforeSave: false
    });

    // 11. Commit
    await session.commitTransaction();

    // 12. Create notification
    await createNotificationService({
      user: userId,
      title: "Order Placed",
      message: `Your order ${order.orderNumber} has been placed successfully.`,
      type: "order",
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        redirectTo: `/orders/${order._id}`,
      },
    });

    // Send Email

    try {
      const user = await User.findById(userId).select("name email");

      await sendEmail({
        to: user.email,
        subject: `Order Placed - ${order.orderNumber}`,
        html: orderPlacedTemplate(
          user.name,
          order.orderNumber,
          order.pricing.grandTotal
        ),
      });
    } catch (error) {
      console.error(
        "Order placed email failed:",
        error.message
      );
    }

    return order;

  } catch (error) {

    await session.abortTransaction();
    throw error;

  } finally {
    session.endSession();
  }
};

export const getMyOrdersService = async (userId, queryParams) => {

  // Get pagination parameters
  const { page, limit, skip, } = getPagination(queryParams);

  // Get sort query
  const sortQuery = buildSortQuery(queryParams.sort);

  // Count total orders
  const totalOrders = await Order.countDocuments({ user: userId, });

  const totalPages = Math.ceil(totalOrders / limit);

  // Fetch orders
  const orders = await Order.find({ user: userId, })
    .select(
      "orderNumber pricing.grandTotal orderStatus paymentStatus placedAt"
    )
    .sort(sortQuery)
    .skip(skip)
    .limit(limit);

  return {
    orders,
    pagination: {
      total: totalOrders,
      page,
      limit,
      totalPages,
    },
  };
};

export const getOrderByIdService = async (orderId, currentUser) => {

  // Validate order ID
  const validOrderId = validateObjectId(orderId, "Order");

  // Find order
  const order = await Order.findById(validOrderId);

  // Check if order exists
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Customers can only view their own orders
  if (currentUser.role === "customer" &&
    order.user.toString() !== currentUser._id.toString()
  ) {
    throw new ApiError(403, "You are not authorized to access this order");
  }

  return order;
};

// Admin Operations
export const getAllOrdersService = async (queryParams) => {

  const filter = {};

  // Order Status Filter
  if (queryParams.orderStatus) {
    filter.orderStatus = queryParams.orderStatus;
  }

  // Payment Status Filter
  if (queryParams.paymentStatus) {
    filter.paymentStatus = queryParams.paymentStatus;
  }

  // Payment Method Filter
  if (queryParams.paymentMethod) {
    filter.paymentMethod = queryParams.paymentMethod;
  }

  // Search Filter
  const searchQuery = buildSearchQuery(queryParams.search,
    [
      "orderNumber",
      "couponCode",
      "shippingAddress.fullName",
      "shippingAddress.phone",
    ]
  );

  // Final Filter
  const finalFilter = { ...filter, ...searchQuery, };

  // Pagination
  const { page, limit, skip, } = getPagination(queryParams);

  // Sorting
  const sortQuery = buildSortQuery(queryParams.sort);

  // Total Orders
  const totalOrders =
    await Order.countDocuments(finalFilter);

  const totalPages = Math.ceil(totalOrders / limit);

  // Fetch Orders
  const orders = await Order.find(finalFilter)
    .populate(
      "user",
      "name email"
    )
    .sort(sortQuery)
    .skip(skip)
    .limit(limit)
    .select(
      `
      orderNumber
      pricing
      paymentMethod
      paymentStatus
      orderStatus
      shippingAddress.fullName
      shippingAddress.phone
      placedAt
      `
    );

  return {
    orders,
    pagination: {
      total: totalOrders,
      page,
      limit,
      totalPages,
    },
  };
};

export const updateOrderStatusService = async (orderId, orderStatus) => {

  // Validate order ID
  const validOrderId = validateObjectId(orderId, "Order");

  // Find order
  const order = await Order.findById(validOrderId);

  // Check if order exists
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Already in requested status
  if (order.orderStatus === orderStatus) {
    throw new ApiError(400, `Order is already ${orderStatus}`);
  }

  // Final states
  if (["delivered", "cancelled"].includes(order.orderStatus)) {
    throw new ApiError(400, `Cannot update a ${order.orderStatus} order status`);
  }

  const allowedTransitions = {
    pending: ["confirmed",],
    confirmed: ["processing"],
    processing: ["shipped"],
    shipped: ["delivered"],
  };

  const allowedNextStatuses = allowedTransitions[order.orderStatus] || [];

  if (!allowedNextStatuses.includes(orderStatus)) {
    throw new ApiError(
      400,
      `Cannot change order status from ${order.orderStatus} to ${orderStatus}`
    );
  }

  // Prevent delivery if Razorpay order is unpaid
  if (orderStatus === "delivered") {

    if (
      order.paymentMethod === "razorpay" &&
      order.paymentStatus !== "paid"
    ) {
      throw new ApiError(
        400,
        "Cannot deliver unpaid Razorpay order"
      );
    }

  }

  // Update status
  order.orderStatus = orderStatus;

  await order.save({
    validateBeforeSave: false,
  });

  // Create notification
  await createNotificationService({
    user: order.user,
    title: `Order ${orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1)}`,
    message: `Your order ${order.orderNumber} is now ${orderStatus}.`,
    type: "order",
    data: {
      orderId: order._id,
      orderNumber: order.orderNumber,
      orderStatus,
      redirectTo: `/orders/${order._id}`,
    },
  });

  // Send Email
  try {
    const user = await User.findById(order.user)
      .select("name email");

    await sendEmail({
      to: user.email,
      subject: `Order ${orderStatus} - ${order.orderNumber}`,
      html: orderStatusTemplate(
        user.name,
        order.orderNumber,
        orderStatus
      ),
    });
  } catch (error) {
    console.error(
      "Order status email failed:",
      error.message
    );
  }

  return order;
};

export const updatePaymentStatusService = async (orderId, paymentStatus) => {

  // Validate order ID
  const validOrderId = validateObjectId(orderId, "Order");

  // Find order
  const order = await Order.findById(validOrderId);

  // Check if order exists
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Already in requested status
  if (order.paymentStatus === paymentStatus) {
    throw new ApiError(400, `Payment is already ${paymentStatus}`);
  }

  // Refunded payments are final
  if (order.paymentStatus === "refunded") {
    throw new ApiError(400, "Cannot update a refunded payment");
  }

  const allowedTransitions = {
    pending: ["paid", "failed",],
    paid: ["refunded",],
    failed: [],
  };

  const allowedNextStatuses = allowedTransitions[order.paymentStatus] || [];

  // Prevent invalid transitions
  if (!allowedNextStatuses.includes(paymentStatus)) {
    throw new ApiError(
      400,
      `Cannot change payment status from ${order.paymentStatus} to ${paymentStatus}`
    );
  }

  // Update payment status
  order.paymentStatus = paymentStatus;

  // Auto-sync order status when payment is completed
  if (paymentStatus === "paid") {

    // Razorpay only affects order flow
    if (order.paymentMethod === "razorpay") {

      if (order.orderStatus === "pending") {
        order.orderStatus = "confirmed";
      }
    }

    // COD: no orderStatus change
  }

  await order.save({
    validateBeforeSave: false,
  });

  return order;
};

export const cancelOrderService = async (orderId, currentUser) => {

  const session = await mongoose.startSession();
  session.startTransaction();

  try {

    // Validate order ID
    const validOrderId = validateObjectId(orderId, "Order");

    // Find order
    const order =
      await Order.findById(validOrderId).session(session);

    // Check if order exists
    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    // Customer can cancel only own orders
    if (currentUser.role === "customer" &&
      order.user.toString() !== currentUser._id.toString()
    ) {
      throw new ApiError(403, "You are not authorized to cancel this order");
    }

    // Already cancelled
    if (order.orderStatus === "cancelled") {
      throw new ApiError(400, "Order is already cancelled");
    }

    // Delivered orders cannot be cancelled
    if (order.orderStatus === "delivered") {
      throw new ApiError(400, "Delivered orders cannot be cancelled");
    }

    // Allow cancellation only before processing
    if (!["pending", "confirmed"].includes(order.orderStatus)) {
      throw new ApiError(400, `Cannot cancel an order in ${order.orderStatus} status`);
    }

    // Restore stock
    for (const item of order.orderItems) {

      const product = await Product.findById(item.product).session(session);

      if (!product) { continue; }

      const variant = product.variants.id(item.variant);

      if (!variant) { continue; }

      variant.stock += item.quantity;

      await product.save({
        session,
        validateBeforeSave: false,
      });
    }

    // Restore coupon usage
    if (order.coupon) {

      await Coupon.findByIdAndUpdate(
        order.coupon,
        {
          $inc: {
            usedCount: -1,
          },
        },
        { session }
      );

      await CouponUsage.findOneAndUpdate(
        {
          coupon: order.coupon,
          user: order.user,
        },
        {
          $inc: {
            usedCount: -1,
          },
        },
        { session }
      );
    }

    // Cancel order
    order.orderStatus = "cancelled";

    await order.save({
      session,
      validateBeforeSave: false,
    });

    await session.commitTransaction();

    // Create cancellation notification
    await createNotificationService({
      user: order.user,
      title: "Order Cancelled",
      message: `Your order ${order.orderNumber} has been cancelled.`,
      type: "order",
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        orderStatus: order.orderStatus,
        cancelledBy: currentUser.role,
        redirectTo: `/orders/${order._id}`,
      },
    });

    // Send Email
    try {
      const user = await User.findById(order.user)
        .select("name email");

      await sendEmail({
        to: user.email,
        subject: `Order Cancelled - ${order.orderNumber}`,
        html: orderCancelledTemplate(
          user.name,
          order.orderNumber
        ),
      });
    } catch (error) {
      console.error(
        "Order cancellation email failed:",
        error.message
      );
    }

    return order;

  } catch (error) {

    await session.abortTransaction();

    throw error;

  } finally {

    session.endSession();

  }
};