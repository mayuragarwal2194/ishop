import express from "express";
import { createCategory, deleteCategoryById, getAllCategories, getCategoryById, getCategoryBySlug, updateCategoryById } from "../controllers/category.controller.js";
import upload from "../middlewares/upload.middleware.js";
import { protect } from "../middlewares/auth_middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/auth_middlewares/role.middleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorizeRoles("admin", "superadmin"),
  upload.single("image"),
  createCategory
);

router.get("/", getAllCategories);
router.get("/slug/:slug", getCategoryBySlug);
router.get("/:id", getCategoryById);

router.delete(
  "/:id",
  protect,
  authorizeRoles("admin", "superadmin"),
  deleteCategoryById
);

router.patch(
  "/:id",
  protect,
  authorizeRoles("admin", "superadmin"),
  upload.single("image"),
  updateCategoryById
);


export default router;
