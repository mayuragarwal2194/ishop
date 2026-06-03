import express from "express";
import { protect } from "../middlewares/auth_middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createAddress, getMyAddresses, getAddressById, updateAddress, setDefaultAddress, deleteAddress } from "../controllers/address.controller.js";
import { createAddressSchema, updateAddressSchema } from "../validators/address.validation.js";
const router = express.Router();


// Create address
router.post(
  "/",
  protect,
  validate(createAddressSchema),
  createAddress
);

// Get all addresses of logged-in user
router.get(
  "/",
  protect,
  getMyAddresses
);

// Get single address
router.get(
  "/:id",
  protect,
  getAddressById
);

// Update address
router.patch(
  "/:id",
  protect,
  validate(updateAddressSchema),
  updateAddress
);

// Set default address
router.patch(
  "/:id/default",
  protect,
  setDefaultAddress
);

// Delete address
router.delete(
  "/:id",
  protect,
  deleteAddress
);

export default router;