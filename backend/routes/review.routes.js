import express from "express";

import {
  createReview,
  updateReview,
  deleteReview,
  getProductReviews,
  getReviewById,
  getMyReviews,
  getAllReviews,
  updateReviewStatus,
  adminReplyReview,
  deleteAdminReplyReview,
} from "../controllers/review.controller.js";

import { protect } from "../middlewares/auth_middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/auth_middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

import {
  createReviewSchema,
  updateReviewSchema,
  updateReviewStatusSchema,
  adminReplyReviewSchema,
} from "../validators/review.validation.js";

const router = express.Router();



/* Public routes */
router.get("/product/:productId", getProductReviews);

/* Customer routes */
router.get(
  "/me/my-reviews",
  protect,
  getMyReviews
);

router.post(
  "/",
  protect,
  validate(createReviewSchema),
  createReview
);

router.patch(
  "/:id",
  protect,
  validate(updateReviewSchema),
  updateReview
);

router.delete(
  "/:id",
  protect,
  deleteReview
);

/* Admin routes */
router.get(
  "/admin/all",
  protect,
  authorizeRoles("admin", "superadmin"),
  getAllReviews
);

router.patch(
  "/admin/:id/status",
  protect,
  authorizeRoles("admin", "superadmin"),
  validate(updateReviewStatusSchema),
  updateReviewStatus
);

router.patch(
  "/admin/:id/reply",
  protect,
  authorizeRoles("admin", "superadmin"),
  validate(adminReplyReviewSchema),
  adminReplyReview
);

router.delete(
  "/admin/:id/reply",
  protect,
  authorizeRoles("admin", "superadmin"),
  deleteAdminReplyReview
);

// Dynamic route at last
router.get("/:id", getReviewById);

export default router;