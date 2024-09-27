import { UserRole } from "@prisma/client";

export type SignUpUserPayload = {
  username: string;
  email: string;
  password: string;
};

export type SignInUserPayload = {
  email: string;
  password: string;
};

export type verifyAccountPayload = {
  token: string;
};

export type AuthJwtPayload = {
  id: number;
  email: string;
  role: UserRole;
};

export type ForgotPasswordPayload = {
  email: string;
};

export type ResetPasswordPayload = {
  resetToken: string;
  newPassword: string;
};
