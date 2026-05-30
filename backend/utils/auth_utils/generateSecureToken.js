import crypto from "crypto";

export const generateSecureToken = () => {

  // Generate raw token
  const token = crypto.randomBytes(32).toString("hex");

  // Hash the token before saving to DB
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  return { token, hashedToken };
}