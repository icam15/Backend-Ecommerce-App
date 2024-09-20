import { z } from "zod";

export class AuthValidation {
  static readonly signUpUserValidation = z.object({
    username: z.string().min(4),
    email: z.string().email(),
    password: z.string().min(8),
  });

  static readonly verifyAccountValidation = z.object({
    token: z.string(),
  });
}
