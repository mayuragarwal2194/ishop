import express from "express";
import { register, login, getMe, logout, refreshToken, forgotPassword, resetPassword, verifyEmail, resendVerificationEmail } from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth_middlewares/auth.middleware.js";
import { sendVerificationEmailService } from "../services/auth.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validate } from "../middlewares/validate.middleware.js";
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from "../validators/auth.validators.js";
const router = express.Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);
router.post("/refresh-token", refreshToken);
router.post("/resend-verification-email", protect, resendVerificationEmail);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password/:token", validate(resetPasswordSchema), resetPassword);
router.get("/verify-email/:token", verifyEmail);


export default router;