export const jwtConfig = {
  accessSecret: process.env.ACCESS_TOKEN_SECRET,
  accessExpiresIn: process.env.ACCESS_TOKEN_EXPIRES || "15m",

  refreshSecret: process.env.REFRESH_TOKEN_SECRET,
  refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES || "7d",
}