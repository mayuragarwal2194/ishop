export const clearAuthCookies = (res) => {
  res.clearCookie("refreshToken");
}