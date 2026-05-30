import express from "express";
import { createSubCategory, deleteSubCategory, getAllSubCategories, getSubCategoryById, updateSubCategory } from "../controllers/subCategory.controller.js";
import upload from "../middlewares/upload.middleware.js";
import { protect } from "../middlewares/auth_middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/auth_middlewares/role.middleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorizeRoles("admin", "superadmin"),
  upload.single("image"),
  createSubCategory
);

router.get("/", getAllSubCategories);
router.get("/:id", getSubCategoryById);

router.delete(
  "/:id",
  protect,
  authorizeRoles("admin", "superadmin"),
  deleteSubCategory
);

router.patch(
  "/:id",
  protect,
  authorizeRoles("admin", "superadmin"),
  upload.single("image"),
  updateSubCategory
);

export default router;
