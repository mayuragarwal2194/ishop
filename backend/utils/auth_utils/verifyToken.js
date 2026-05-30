import jwt from "jsonwebtoken";

export const verifyAccessToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } 
  catch (err) {
    return null;
  }
}