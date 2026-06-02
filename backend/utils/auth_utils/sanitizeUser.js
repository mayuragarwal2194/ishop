export const sanitizeUser = (user) => {
  const userResponse = user.toObject();

  delete userResponse.password;
  delete userResponse.refreshToken;
  delete userResponse.passwordResetToken;
  delete userResponse.passwordResetExpires;
  delete userResponse.emailVerificationToken;
  delete userResponse.emailVerificationExpires;
  delete userResponse.tokenVersion;
  delete userResponse.deletedAt;
  delete userResponse.__v;

  return userResponse;
};