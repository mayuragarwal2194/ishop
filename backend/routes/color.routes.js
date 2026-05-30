import express from 'express';
import { addColor, deleteColorById, getAllColors, getColorById, getColorBySlug, updateColorById } from '../controllers/color.controller.js';
import { protect } from '../middlewares/auth_middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/auth_middlewares/role.middleware.js';

const router = express.Router();

router.post(
  "/",
  protect,
  authorizeRoles("admin", "superadmin"),
  addColor
);

router.get("/", getAllColors);
router.get("/slug/:slug", getColorBySlug);
router.get("/:id", getColorById);

router.delete(
  "/:id",
  protect,
  authorizeRoles("admin", "superadmin"),
  deleteColorById
);

router.patch(
  "/:id",
  protect,
  authorizeRoles("admin", "superadmin"),
  updateColorById
);


export default router;