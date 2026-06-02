import { registerUser, loginUser, logoutUser, refreshAccessTokenService, forgotPasswordService, resetPasswordService, verifyEmailService, sendVerificationEmailService } from "../services/auth.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sanitizeUser } from "../utils/auth_utils/sanitizeUser.js";
import { setAuthCookies } from "../utils/auth_utils/setAuthCookies.js";

export const register = asyncHandler(async (req, res) => {

  const result = await registerUser(req.validatedData);

  // Set refresh token in HTTP-only cookie
  setAuthCookies(res, result.refreshToken);

  // Send response
  return ApiResponse(
    res,
    201,
    "User registered successfully",
    {
      user: result.user,
      accessToken: result.accessToken,
    }
  );
});

export const login = asyncHandler(async (req, res) => {
  const result = await loginUser(req.validatedData);

  // Set refresh token in HTTP-only cookie
  setAuthCookies(res, result.refreshToken);

  // Send response
  return ApiResponse(
    res,
    200,
    "User logged in successfully",
    {
      user: result.user,
      accessToken: result.accessToken,
    }
  );
});

export const logout = asyncHandler(async (req, res) => {
  await logoutUser(req.user._id);

  res.clearCookie("refreshToken");

  return ApiResponse(
    res,
    200,
    "User logged out successfully",
    null
  );

});

export const getMe = asyncHandler(async (req, res) => {
  const user = req.user;

  return ApiResponse(
    res,
    200,
    "User profile fetched successfully",
    {
      user: sanitizeUser(user),
    }
  );
});

export const refreshToken = asyncHandler(async (req, res) => {

  const incomingRefreshToken = req.cookies?.refreshToken;

  const result = await refreshAccessTokenService(incomingRefreshToken);

  // Update cookie with rotated refresh token
  setAuthCookies(res, result.refreshToken);

  return ApiResponse(
    res,
    200,
    "Access token refreshed successfully",
    {
      accessToken: result.accessToken,
    }
  );
});

export const forgotPassword = asyncHandler(async (req, res) => {

  const { email } = req.validatedData;

  await forgotPasswordService(email);

  return ApiResponse(
    res,
    200,
    "Password reset token generated and sent to email successfully",
    null
  );
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;

  // console.log(req.body);

  const { newPassword } = req.validatedData;

  await resetPasswordService(token, newPassword);

  return ApiResponse(
    res,
    200,
    "Password reset successfully",
    null
  );
});

export const resendVerificationEmail = asyncHandler(async (req, res) => {
  await sendVerificationEmailService(req.user);

  return ApiResponse(
    res,
    200,
    "Verification email sent successfully",
    null
  );
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  await verifyEmailService(token);

  return ApiResponse(
    res,
    200,
    "Email verified successfully",
    null
  );
});