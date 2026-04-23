import express from "express";
import { createBrand, deleteBrandById, getAllBrands, getBrandById, getBrandBySlug, updateBrandById } from "../controllers/brand.controller.js";
import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

router.post("/", upload.single("logo"), createBrand);
router.get("/", getAllBrands);
router.get("/slug/:slug", getBrandBySlug);
router.get("/:id", getBrandById);
router.delete("/:id", deleteBrandById);
router.patch("/:id",upload.single("logo"), updateBrandById);

export default router;