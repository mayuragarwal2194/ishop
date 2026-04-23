import express from "express";
import { createCategory, deleteCategoryById, getAllCategories, getCategoryById, getCategoryBySlug, updateCategoryById } from "../controllers/category.controller.js";
import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

router.post("/", upload.single("image"), createCategory);
router.get("/", getAllCategories);
router.get("/slug/:slug", getCategoryBySlug);
router.get("/:id", getCategoryById);
router.delete("/:id", deleteCategoryById);
router.patch("/:id",upload.single("image"), updateCategoryById);


export default router;
