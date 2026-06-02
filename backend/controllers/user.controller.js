import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { clearAuthCookies } from "../utils/auth_utils/clearAuthCookies.js";
import { changePasswordService, updateMyProfileService, deleteMyAccountService, updateAvatarService, deleteAvatarService, getAllUsersService, getUserByIdService, updateUserStatusService, updateUserRoleService, restoreUserService } from "../services/user.service.js";


export const updateMyProfile = asyncHandler(async (req, res) => {
  const result = await updateMyProfileService(
    req.user._id,
    req.validatedData
  );

  return ApiResponse(
    res,
    200,
    "Profile updated successfully",
    result
  );
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.validatedData;

  // Call service to change password
  await changePasswordService(
    req.user._id,
    currentPassword,
    newPassword
  );

  // clear refresh token cookie
  clearAuthCookies(res);

  return ApiResponse(
    res,
    200,
    "Password changed successfully, please login again with your new password"
  );
});

export const deleteMyAccount = asyncHandler(async (req, res) => {
  const { password } = req.validatedData;

  await deleteMyAccountService(
    req.user._id,
    password
  );

  // clear refresh token cookie
  clearAuthCookies(res);

  return ApiResponse(
    res,
    200,
    "Account deleted successfully"
  );
});

export const updateAvatar = asyncHandler(async (req, res) => {

  const result = await updateAvatarService(
    req.user._id,
    req.file
  );

  return ApiResponse(
    res,
    200,
    "Avatar updated successfully",
    result
  );
});

export const deleteAvatar = asyncHandler(async (req, res) => {
  const result = await deleteAvatarService(
    req.user._id,
  );
  
  return ApiResponse(
    res,
    200,
    "Avatar deleted successfully",
    result
  );
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const result = await getAllUsersService(
    req.query
  );

  return ApiResponse(
    res,
    200,
    "Users fetched successfully",
    result.users,
    result.pagination
  );
});

export const getUserById = asyncHandler(async (req, res) => {
  const result = await getUserByIdService(req.params.id);

  return ApiResponse(
    res,
    200,
    "User fetched successfully",
    result
  );
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const result = await updateUserStatusService(
    req.params.id,
    req.user,
    req.validatedData.status
  );

  return ApiResponse(
    res,
    200,
    "User status updated successfully",
    result
    );
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const result = await updateUserRoleService(
    req.params.id,
    req.user,
    req.validatedData.role
  );

  return ApiResponse(
    res,
    200,
    "User role updated successfully",
    result
  );
});

export const restoreUser = asyncHandler(async (req, res) => {
  const result = await restoreUserService(
    req.params.id,
    req.user
  );

  return ApiResponse(
    res,
    200,
    "User restored successfully",
    result
  );
});