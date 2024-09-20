import dayjs from "dayjs";
import { verify, sign } from "jsonwebtoken";

type VerificationAccountPayload = {
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

export const verifyToken = (token: string) => {
  return verify(
    token,
    process.env.VERIFY_ACCOUNT_SECRET!
  ) as VerificationAccountPayload;
};

export const generateResetPasswordToken = () => {};
