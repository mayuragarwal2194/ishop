import express from 'express';
import { changePassword, deleteAvatar, deleteMyAccount, getAllUsers, updateAvatar, updateMyProfile, getUserById, updateUserStatus, updateUserRole, restoreUser } from '../controllers/user.controller.js';
import { protect } from '../middlewares/auth_middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import upload from "../middlewares/upload.middleware.js";
import { changePasswordSchema, updateProfileSchema, deleteAccountSchema, updateUserStatusSchema, updateUserRoleSchema } from '../validators/user.validation.js';
import { authorizeRoles } from '../middlewares/auth_middlewares/role.middleware.js';
const router = express.Router();

router.patch("/me", protect, validate(updateProfileSchema), updateMyProfile);
router.patch("/change-password", protect, validate(changePasswordSchema), changePassword);
router.patch("/avatar", protect, upload.single("avatar"), updateAvatar);
router.delete("/me", protect, validate(deleteAccountSchema), deleteMyAccount);
router.delete("/avatar", protect, deleteAvatar);
router.get(
  "/",
  protect,
  authorizeRoles("admin", "superadmin"),
  getAllUsers
);

router.patch(
  "/:id/status",
  protect,
  authorizeRoles("admin", "superadmin"),
  validate(updateUserStatusSchema),
  updateUserStatus
);

router.patch(
  "/:id/role",
  protect,
  authorizeRoles("superadmin"),
  validate(updateUserRoleSchema),
  updateUserRole
);

router.patch(
  "/:id/restore",
  protect,
  authorizeRoles("admin", "superadmin"),
  restoreUser
);

router.get(
  "/:id",
  protect,
  authorizeRoles("admin", "superadmin"),
  getUserById
);

export default router;