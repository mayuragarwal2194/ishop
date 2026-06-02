import jwt from "jsonwebtoken";
import { jwtConfig } from "../../config/jwt.js";
import User from "../../models/user.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const protect = asyncHandler(async (req, res, next) => {
  // Get token from authorization header
  const authHeader = req.headers.authorization;

  // Check if authorization header exists and starts with "Bearer "
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Unauthorized: No token provided");
  }

  // Extract token from header
  const token = authHeader.split(" ")[1];

  // Verify token
  let decoded;

  try {
    decoded = jwt.verify(token, jwtConfig.accessSecret);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Access token expired");
    }

    if (error.name === "JsonWebTokenError") {
      throw new ApiError(401, "Invalid token");
    }

    throw error;
  }

  // Find user by ID from token payload
  const user = await User.findById(decoded.userId);

  // If user not found, throw unauthorized error
  if (!user) {
    throw new ApiError(401, "Unauthorized: User not found");
  }

  // Check token version (instant logout support)
  if (decoded.tokenVersion !== user.tokenVersion) {
    throw new ApiError(401, "Session expired");
  }

  // Check if user is deleted or suspended
  if (user.isDeleted) {
    throw new ApiError(403, "Account has been deleted");
  }

  // Check if user is suspended
  if (user.status === "suspended") {
    throw new ApiError(
      403,
      "Account has been suspended. Please contact support."
    );
  }

  // Attach user to request object
  req.user = user;

  next();

});