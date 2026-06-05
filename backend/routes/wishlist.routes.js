import express from "express";

import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  clearWishlist,
} from "../controllers/wishlist.controller.js";

import { protect } from "../middlewares/auth_middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

import {
  addToWishlistSchema,
  removeFromWishlistSchema,
} from "../validators/wishlist.validation.js";

const router = express.Router();

router.post(
  "/",
  protect,
  validate(addToWishlistSchema),
  addToWishlist
);

router.get(
  "/",
  protect,
  getWishlist
);

router.delete(
  "/item",
  protect,
  validate(removeFromWishlistSchema),
  removeFromWishlist
);

router.delete(
  "/",
  protect,
  clearWishlist
);

export default router;