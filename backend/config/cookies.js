import { COOKIE_MAX_AGE } from "../utils/constants.js";

export const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: COOKIE_MAX_AGE, // 7 days
};