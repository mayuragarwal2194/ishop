import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { comparePassword } from "../utils/auth_utils/comparePassword.js";
import { hashPassword } from "../utils/auth_utils/hashPassword.js";
import { sanitizeUser } from "../utils/auth_utils/sanitizeUser.js";
import { deleteImage, uploadImage } from "./upload.service.js";
import { DEFAULT_USER_AVATAR } from "../utils/constants.js";
import { parseBoolean } from "../helper/parseBoolean.helper.js";
import { buildSearchQuery } from "../utils/search.js";
import { buildSortQuery } from "../utils/buildSortQuery.js";
import { getPagination } from "../utils/pagination.js";
import { validateObjectId } from "../utils/validateObjectId.js";


export const updateMyProfileService = async (userId, updateData) => {
  const { name } = updateData;

  // Find user by ID
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Update name
  if (name !== undefined) {
    user.name = name;
  }

  // Save updated user
  await user.save({
    validateBeforeSave: false,
  });

  return sanitizeUser(user);
}

export const changePasswordService = async (userId, currentPassword, newPassword) => {
  // Find user by ID
  const user = await User.findById(userId).select("+password");

  // Check if user exists
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Check if current password is correct
  const isMatch = await comparePassword(currentPassword, user.password);

  // If password does not match, throw error
  if (!isMatch) {
    throw new ApiError(400, "Current password is incorrect");
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // update password
  user.password = hashedPassword;

  // invalidate all existing refresh tokens by clearing the field
  user.refreshToken = null;
  user.tokenVersion += 1;

  // Save updated user
  await user.save({
    validateBeforeSave: false,
  });

  return;
}

export const deleteMyAccountService = async (userId, password) => {
  // Find user by ID
  const user = await User.findById(userId).select("+password");

  // Check if user exists
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // verify password
  const isMatch = await comparePassword(password, user.password);

  // If password does not match, throw error
  if (!isMatch) {
    throw new ApiError(401, "Incorrect password");
  }

  // Mark user as deleted
  user.isDeleted = true;
  user.deletedAt = new Date();


  // Invalidate all session by clearing refresh token and incrementing token version 
  user.refreshToken = null;
  user.tokenVersion += 1;

  // Save updated user
  await user.save({
    validateBeforeSave: false,
  });

  return true;

}

export const updateAvatarService = async (
  userId,
  avatarFile
) => {

  // Check if file is provided
  if (!avatarFile) {
    throw new ApiError(
      400,
      "Avatar image is required"
    );
  }

  // Find user by ID
  const user = await User.findById(userId);

  // Check if user exists
  if (!user) {
    throw new ApiError(
      404,
      "User not found"
    );
  }

  // Upload new avatar
  const uploadedAvatar = await uploadImage(
    avatarFile.path,
    "ishop/users"
  );

  // Store old public_id
  const oldPublicId =
    user.avatar?.public_id;

  try {

    // Update avatar
    user.avatar = {
      url: uploadedAvatar.url,
      public_id: uploadedAvatar.public_id,
    };

    // Save updated user
    await user.save({
      validateBeforeSave: false,
    });

  } catch (error) {

    // Rollback newly uploaded avatar
    try {
      await deleteImage(
        uploadedAvatar.public_id
      );
    } catch (rollbackError) {
      console.error(
        "Avatar rollback failed:",
        rollbackError.message
      );
    }

    throw error;
  }

  // Delete old avatar after successful save
  if (oldPublicId) {
    try {
      await deleteImage(oldPublicId);
    } catch (error) {
      console.error(
        "Failed to delete old avatar:",
        error.message
      );
    }
  }

  return sanitizeUser(user);
};

export const deleteAvatarService = async (userId) => {
  // Find user by ID
  const user = await User.findById(userId);

  // Check if user exists
  if (!user) {
    throw new ApiError(
      404,
      "User not found"
    );
  }

  // Check if user already has default avatar
  if (!user.avatar?.public_id) {
    throw new ApiError(
      400,
      "Default avatar can not be deleted"
    );
  }

  // Delete avatar from cloud
  await deleteImage(user.avatar.public_id);

  // Reset avatar to default image
  user.avatar = {
    url: DEFAULT_USER_AVATAR,
    public_id: null,
  }

  // Save updated user
  await user.save({
    validateBeforeSave: false,
  });

  return sanitizeUser(user);
}

export const getAllUsersService = async (queryParams) => {
  const filter = {};

  // only include deleted users if isDeleted query param is explicitly set to true, otherwise exclude deleted users by default
  if (queryParams.isDeleted !== undefined) {
    filter.isDeleted = parseBoolean(queryParams.isDeleted);
  } else {
    filter.isDeleted = false;
  }

  // Role filter
  if (queryParams.role) {
    filter.role = queryParams.role;
  }

  // Status filter
  if (queryParams.status) {
    filter.status = queryParams.status;
  }

  // Search filter
  const searchQuery = buildSearchQuery(queryParams.search, ["name", "email", "phone"]);

  // Combine filters and search into final query
  const finalFilter = { ...filter, ...searchQuery };

  // Get pagination parameters
  const { page, limit, skip } = getPagination(queryParams);

  // Get sort query
  const sortQuery = buildSortQuery(queryParams.sort);

  const totalUsers = await User.countDocuments(finalFilter);

  const totalPages = Math.ceil(totalUsers / limit);

  // Fetch users with filters, pagination, and sorting
  const users = await User.find(finalFilter)
    .sort(sortQuery)
    .skip(skip)
    .limit(limit);

  // Sanitize user data before sending response
  const sanitizedUsers = users.map((user) => sanitizeUser(user));

  return {
    users: sanitizedUsers,
    pagination: {
      total: totalUsers,
      page,
      limit,
      totalPages
    }
  };
}

export const getUserByIdService = async (userId) => {
  // Validate user ID
  const validUserId = validateObjectId(userId, "User");

  // Find user by ID
  const user = await User.findById(validUserId);

  // Check if user exists
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return sanitizeUser(user);
}

export const updateUserStatusService = async (targetUserId, currentUser, status) => {

  // Validate user ID
  const validUserId = validateObjectId(targetUserId, "User");

  // Find user by ID
  const targetUser = await User.findById(validUserId);

  // Check if user exists
  if (!targetUser) {
    throw new ApiError(404, "User not found");
  }

  // Self status update is not allowed
  if (targetUser._id.toString() === currentUser._id.toString()) {
    throw new ApiError(403, "You cannot change your own status");
  }

  if(currentUser.role === "admin" && targetUser.role !== "customer") {
    throw new ApiError(403, "You are only allowed to manage customer accounts");
  }

  // Superadmin users cannot manage other superadmin accounts
  if(currentUser.role === "superadmin" && targetUser.role === "superadmin") {
    throw new ApiError(403, "You are not allowed to manage other superadmin accounts");
  }

  // If user already has the desired status, throw error
  if(targetUser.status === status) {
    throw new ApiError(400, `User is already ${status}`);
  }

  // Update user status
  targetUser.status = status;

  // If suspending user, invalidate all active sessions
  if(status === "suspended") {
    targetUser.refreshToken = null;
    targetUser.tokenVersion += 1;
  }

  // Save updated user
  await targetUser.save({
    validateBeforeSave: false,
  });

  // Return sanitized user data
  return sanitizeUser(targetUser);
}

export const updateUserRoleService = async (targetUserId, currentUser, role) => {
  // Validate user ID
  const validUserId = validateObjectId(targetUserId, "User");

  // Find user by ID
  const targetUser = await User.findById(validUserId);

  // Check if user exists
  if (!targetUser) {
    throw new ApiError(404, "User not found");
  }

  // Prevent self role update
  if (targetUser._id.toString() === currentUser._id.toString()) {
    throw new ApiError(403, "You cannot change your own role");
  }

  // Can not change role of superadmin users
  if(targetUser.role === "superadmin") {
    throw new ApiError(403, "Superadmin role cannot be modified");
  }

  // Already has desired role
  if(targetUser.role === role) {
    throw new ApiError(400, `User is already ${role}`);
  }

  // Update user role
  targetUser.role = role;

  // Invalidate all active sessions
  targetUser.refreshToken = null;
  targetUser.tokenVersion += 1;

  // Save updated user
  await targetUser.save({
    validateBeforeSave: false,
  });

  // Return sanitized user data
  return sanitizeUser(targetUser);
}

export const restoreUserService = async (targetUserId, currentUser) => {

  // Validate user ID 
  const validUserId = validateObjectId(targetUserId, "User");

  // Find user by ID
  const targetUser = await User.findById(validUserId);

  // Check if user exists
  if (!targetUser) {
    throw new ApiError(404, "User not found");
  }

  // Check if user is actually deleted
  if (!targetUser.isDeleted) {
    throw new ApiError(400, "User account is already active"); 
  }

  // Prevent self restore
  if (targetUser._id.toString() === currentUser._id.toString()) {
    throw new ApiError(403, "You cannot restore your own account");
  }

  // Admins should only be able to restore customer accounts
  if(currentUser.role === "admin" && targetUser.role !== "customer") {
    throw new ApiError(403, "You are only allowed to restore customer accounts");
  }

  //  Noone should be able to restore superadmin accounts
  if(targetUser.role === "superadmin") {
    throw new ApiError(403, "Superadmin accounts cannot be restored");
  }

  // Restore user account
  targetUser.isDeleted = false;
  targetUser.deletedAt = null;

  // Save updated user
  await targetUser.save({
    validateBeforeSave: false,
  });

  // Return sanitized user data
  return sanitizeUser(targetUser);
  
}