import express from "express";
import { createBrand, deleteBrandById, getAllBrands, getBrandById, getBrandBySlug, updateBrandById } from "../controllers/brand.controller.js";
import upload from "../middlewares/upload.middleware.js";
import { protect } from "../middlewares/auth_middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/auth_middlewares/role.middleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorizeRoles("admin", "superadmin"),
  upload.single("logo"),
  createBrand
);

router.get("/", getAllBrands);
router.get("/slug/:slug", getBrandBySlug);
router.get("/:id", getBrandById);

router.delete(
  "/:id",
  protect,
  authorizeRoles("admin", "superadmin"),
  deleteBrandById
);

router.patch(
  "/:id",
  protect,
  authorizeRoles("admin", "superadmin"),
  upload.single("logo"),
  updateBrandById
);

export default router;