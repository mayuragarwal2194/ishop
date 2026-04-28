import express from "express";
import { createSubCategory, deleteSubCategory, getAllSubCategories, getSubCategoryById, updateSubCategory } from "../controllers/subCategory.controller.js";
import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

router.post("/", upload.single("image"), createSubCategory);
router.get("/", getAllSubCategories);
router.get("/:id", getSubCategoryById);
router.delete("/:id", deleteSubCategory);
router.patch("/:id", upload.single("image"), updateSubCategory);

export default router;
