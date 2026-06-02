import User from "../models/user.model.js";
import crypto from "crypto";
import { hashPassword } from "../utils/auth_utils/hashPassword.js";
import { generateAccessToken, generateRefreshToken } from "../utils/auth_utils/generateTokens.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { jwtConfig } from "../config/jwt.js";
import { comparePassword } from "../utils/auth_utils/comparePassword.js";
import { generateSecureToken } from "../utils/auth_utils/generateSecureToken.js";
import { sendEmail } from "../utils/auth_utils/sendEmail.js";
import { EMAIL_VERIFICATION_EXPIRES, PASSWORD_RESET_EXPIRES } from "../utils/constants.js";
import { verifyEmailTemplate } from "../utils/email_templates/verifyEmailTemplate.js";
import { forgotPasswordTemplate } from "../utils/email_templates/forgotPasswordTemplate.js";
import { sanitizeUser } from "../utils/auth_utils/sanitizeUser.js";


export const registerUser = async (userData) => {
  const { name, email, password } = userData;

  // Check if user already exists
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, "User already exists");
  }

  // Hash the password
  const hashedPassword = await hashPassword(password);

  // Create new user
  const newUser = new User({
    name,
    email,
    password: hashedPassword,
  });

  // Generate access token
  const accessToken = generateAccessToken(newUser);

  // Generate refresh token
  const refreshToken = generateRefreshToken({
    userId: newUser._id,
    role: newUser.role,
    tokenVersion: newUser.tokenVersion,
  });

  // Save refresh token in DB
  newUser.refreshToken = refreshToken;

  await newUser.save();

  // Send verification email
  try {
    await sendVerificationEmailService(newUser);
  } catch (error) {
    console.error(
      "Verification email failed:",
      error.message
    );
  }

  return {
    user: sanitizeUser(newUser),
    accessToken,
    refreshToken,
  };
}

export const loginUser = async (userData) => {
  const { email, password } = userData;

  // Find user by email
  const user = await User.findOne({ email }).select("+password +refreshToken");

  // Check if user exists
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  // Check if account is deleted
  if (user.isDeleted) {
    throw new ApiError(
      403,
      "Account has been deleted"
    );
  }

  // Check if account is suspended
  if (user.status === "suspended") {
    throw new ApiError(
      403,
      "Account has been suspended"
    );
  }

  // Compare passwords
  const isPasswordCorrect = await comparePassword(password, user.password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid email or password");
  }

  // Generate access token
  const accessToken = generateAccessToken(user);

  // Generate refresh token
  const refreshToken = generateRefreshToken({
    userId: user._id,
    role: user.role,
    tokenVersion: user.tokenVersion,
  });

  // Save new refresh token in DB
  user.refreshToken = refreshToken;

  // Update last login time
  user.lastLogin = new Date();

  await user.save({
    validateBeforeSave: false,
  });

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  };
}

export const logoutUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Clear refresh token from DB
  user.refreshToken = null;

  // Invalidate existing tokens by incrementing token version
  user.tokenVersion += 1;

  // Save user without validation
  await user.save({
    validateBeforeSave: false,
  });

  return true;
}

export const refreshAccessTokenService = async (incomingRefreshToken) => {
  // Check if refresh token exists in DB
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token missing");
  }

  let decoded;

  // Verify refresh token
  try {
    decoded = jwt.verify(incomingRefreshToken, jwtConfig.refreshSecret);
  } catch (error) {

    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Refresh token expired");
    }

    if (error.name === "JsonWebTokenError") {
      throw new ApiError(401, "Invalid refresh token");
    }

    throw error;
  }

  // Find user by ID from token payload
  const user = await User.findById(decoded.userId).select("+refreshToken");

  if (!user) {
    throw new ApiError(401, "User not found");
  }

  // Check if account is deleted
  if (user.isDeleted) {
    throw new ApiError(
      403,
      "Account has been deleted"
    );
  }

  // Check if account is suspended
  if (user.status === "suspended") {
    throw new ApiError(
      403,
      "Account has been suspended"
    );
  }

  // Check token version (instant logout support)
  if (decoded.tokenVersion !== user.tokenVersion) {
    throw new ApiError(401, "Session expired");
  }

  // Check if refresh token matches the one in DB
  if (user.refreshToken !== incomingRefreshToken) {
    throw new ApiError(401, "Invalid refresh token");
  }

  // Generate new access token
  const newAccessToken = generateAccessToken(user);

  // Generate rotated refresh token
  const newRefreshToken = generateRefreshToken({
    userId: user._id,
    role: user.role,
    tokenVersion: user.tokenVersion,
  });

  // Save new refresh token in DB
  user.refreshToken = newRefreshToken;

  await user.save({
    validateBeforeSave: false,
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}

export const forgotPasswordService = async (email) => {
  // Find user by email
  const user = await User.findOne({ email });

  // Check if user exists
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // console.log(user);
  // Generate reset token
  const { token, hashedToken } = generateSecureToken();

  // Save hashed reset token
  user.passwordResetToken = hashedToken;

  // Set token expiration time (e.g., 1 hour)
  user.passwordResetExpires = Date.now() + PASSWORD_RESET_EXPIRES; // 15 minutes

  // Save user without validation
  await user.save({
    validateBeforeSave: false,
  });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

  // console.log(user.email);

  await sendEmail({
    to: user.email,
    subject: "Password Reset Request",
    html: forgotPasswordTemplate(
      user.name,
      resetUrl
    ),
  });

  return
}

export const resetPasswordService = async (token, newPassword) => {

  // Hash the incoming token to compare with DB
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // Find user by hashed reset token and check if token is not expired
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // If no user found, token is invalid or expired
  if (!user) {
    throw new ApiError(400, "Invalid or expired password reset token");
  }

  // Hash the new password
  const hashedPassword = await hashPassword(newPassword);

  // Update user's password
  user.password = hashedPassword;

  // Clear reset token fields
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  // Invalidate existing sessions by incrementing token version
  user.refreshToken = null; // Clear any existing refresh token
  user.tokenVersion += 1;

  // Save user without validation
  await user.save({
    validateBeforeSave: false,
  });

  return;
}

export const sendVerificationEmailService = async (user) => {
  // Check if email is already verified
  if (user.isEmailVerified) {
    throw new ApiError(400, "Email is already verified");
  }

  // Generate verification token
  const { token, hashedToken } = generateSecureToken();

  // Save hashed verification token
  user.emailVerificationToken = hashedToken;

  // Set token expiration time (e.g., 1 hour)
  user.emailVerificationExpires = Date.now() + EMAIL_VERIFICATION_EXPIRES; // 24 hours

  // Save user without validation
  await user.save({
    validateBeforeSave: false,
  });

  //  Construct verification URL
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;

  // Send verification email
  await sendEmail({
    to: user.email,
    subject: "Email Verification",
    html: verifyEmailTemplate(
      user.name,
      verificationUrl
    )
  });

  return;
}

export const verifyEmailService = async (token) => {
  // Hash the incoming token to compare with DB
  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  // Find user by hashed verification token and check if token is not expired
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  });

  // If no user found, token is invalid or expired
  if (!user) {
    throw new ApiError(400, "Invalid or expired email verification token");
  }

  // Mark email as verified
  user.isEmailVerified = true;

  // Clear verification token fields
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;

  // Save user without validation
  await user.save({
    validateBeforeSave: false,
  });

  return;
}