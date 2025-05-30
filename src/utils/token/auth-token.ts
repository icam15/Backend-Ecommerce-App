import { sign, verify } from "jsonwebtoken";
import { AuthJwtPayload } from "../../types/auth-types";

const generateJwtAccessToken = (payload: AuthJwtPayload) => {
  return sign(payload, process.env.JWT_ACCESS_SECRET!, { expiresIn: "1h" });
};

const generateJwtRefreshToken = (payload: AuthJwtPayload) => {
  return sign(payload, process.env.JWT_REFRESH_SECRET!, { expiresIn: "1d" });
};

export const verifyRefreshToken = (token: string) => {
  return verify(token, process.env.JWT_REFRESH_SECRET!) as AuthJwtPayload;
};

export const generateAuthToken = (payload: AuthJwtPayload) => {
  const accessToken = generateJwtAccessToken(payload);
  const refreshToken = generateJwtRefreshToken(payload);
  return { accessToken, refreshToken };
};
