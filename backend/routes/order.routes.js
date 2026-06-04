import express from "express";

import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
} from "../controllers/order.controller.js";

import { protect } from "../middlewares/auth_middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/auth_middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

import {
  createOrderSchema,
  updateOrderStatusSchema,
  updatePaymentStatusSchema,
} from "../validators/order.validation.js";

const router = express.Router();


// Customer Routes

router.post(
  "/",
  protect,
  validate(createOrderSchema),
  createOrder
);

router.get(
  "/my-orders",
  protect,
  getMyOrders
);

router.get(
  "/:id",
  protect,
  getOrderById
);

router.patch(
  "/:id/cancel",
  protect,
  cancelOrder
);


// Admin / SuperAdmin Routes

router.get(
  "/",
  protect,
  authorizeRoles("admin", "superadmin"),
  getAllOrders
);

router.patch(
  "/:id/status",
  protect,
  authorizeRoles("admin", "superadmin"),
  validate(updateOrderStatusSchema),
  updateOrderStatus
);

router.patch(
  "/:id/payment-status",
  protect,
  authorizeRoles("admin", "superadmin"),
  validate(updatePaymentStatusSchema),
  updatePaymentStatus
);

export default router;