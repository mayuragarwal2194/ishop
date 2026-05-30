import { refreshCookieOptions } from "../../config/cookies.js";

export const setAuthCookies = (res, refreshToken) => {
  res.cookie(
    "refreshToken",
    refreshToken,
    refreshCookieOptions
  );
}