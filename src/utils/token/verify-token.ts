import { verify, sign } from "jsonwebtoken";

type VerificationAccountPayload = {
  userId: number;
  email: string;
  expiredAt: Date;
};

type ResetPasswordTokenPayload = {
  userId: number;
  email: string;
  expiredAt: Date;
};

export const generateVerifyAccountToken = (
  payload: VerificationAccountPayload
) => {
  const token = sign(payload, process.env.VERIFY_ACCOUNT_SECRET!);
  return { token };
};

export const verifyVericationToken = (token: string) => {
  return verify(
    token,
    process.env.VERIFY_ACCOUNT_SECRET!
  ) as VerificationAccountPayload;
};

export const generateResetPasswordToken = (
  payload: ResetPasswordTokenPayload
) => {
  const token = sign(payload, process.env.RESET_PASSWORD_SECRET!);
  return { token };
};

export const verifyResetPasswordToken = (token: string) => {
  return verify(
    token,
    process.env.RESET_PASSWORD_SECRET!
  ) as ResetPasswordTokenPayload;
};