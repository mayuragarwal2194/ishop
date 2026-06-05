import express from "express";

import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  handleRazorpayFailure,
  getMyPayments,
  getPaymentById,
  getAllPayments,
  getPaymentsByUserId,
} from "../controllers/payment.controller.js";

import { protect } from "../middlewares/auth_middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/auth_middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

import {
  createRazorpayOrderSchema,
  verifyRazorpayPaymentSchema,
  handleRazorpayFailureSchema,
} from "../validators/payment.validation.js";

const router = express.Router();

// User payment actions
router.post(
  "/razorpay/create-order",
  protect,
  validate(createRazorpayOrderSchema),
  createRazorpayOrder
);

router.post(
  "/razorpay/verify",
  protect,
  validate(verifyRazorpayPaymentSchema),
  verifyRazorpayPayment
);

router.post(
  "/razorpay/failure",
  protect,
  validate(handleRazorpayFailureSchema),
  handleRazorpayFailure
);

// User payment history
router.get(
  "/my-payments",
  protect,
  getMyPayments
);

// Admin routes
router.get(
  "/admin/all",
  protect,
  authorizeRoles("admin", "superadmin"),
  getAllPayments
);

router.get(
  "/admin/user/:userId",
  protect,
  authorizeRoles("admin", "superadmin"),
  getPaymentsByUserId
);

// Single payment detail
router.get(
  "/:paymentId",
  protect,
  getPaymentById
);

export default router;