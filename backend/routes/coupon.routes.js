import express from "express";

import {
  createCoupon,
  getCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
} from "../controllers/coupon.controller.js";

import { protect } from "../middlewares/auth_middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/auth_middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

import {
  createCouponSchema,
  updateCouponSchema,
  validateCouponSchema,
} from "../validators/coupon.validation.js";

const router = express.Router();

// Validate coupon (Customer/Admin/SuperAdmin)
router.post(
  "/validate",
  protect,
  validate(validateCouponSchema),
  validateCoupon
);

// Create coupon
router.post(
  "/",
  protect,
  authorizeRoles("admin", "superadmin"),
  validate(createCouponSchema),
  createCoupon
);

// Get all coupons
router.get(
  "/",
  protect,
  authorizeRoles("admin", "superadmin"),
  getCoupons
);

// Get coupon by ID
router.get(
  "/:id",
  protect,
  authorizeRoles("admin", "superadmin"),
  getCouponById
);

// Update coupon
router.patch(
  "/:id",
  protect,
  authorizeRoles("admin", "superadmin"),
  validate(updateCouponSchema),
  updateCoupon
);

// Deactivate coupon
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin", "superadmin"),
  deleteCoupon
);

export default router;