import express from 'express';
import { addColor, deleteColorById, getAllColors, getColorById, getColorBySlug, updateColorById } from '../controllers/color.controller.js';

const router = express.Router();

router.post("/", addColor);
router.get("/", getAllColors);
router.get("/slug/:slug", getColorBySlug);
router.get("/:id", getColorById);
router.delete("/:id", deleteColorById);
router.patch("/:id", updateColorById);


export default router;