import express from 'express';
import { protect } from '../middlewares/auth_middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { addToCartSchema, updateCartItemSchema } from '../validators/cart.validation.js';
import { addToCart, clearCart, getCart, removeCartItem, updateCartItem } from '../controllers/cart.controller.js';
const router = express.Router();

router.post("/", protect, validate(addToCartSchema), addToCart);
router.get("/", protect, getCart);
router.delete("/", protect, clearCart);
router.patch(
  "/items/:variantId",
  protect,
  validate(updateCartItemSchema),
  updateCartItem);

router.delete(
  "/items/:variantId",
  protect,
  removeCartItem
);

export default router;