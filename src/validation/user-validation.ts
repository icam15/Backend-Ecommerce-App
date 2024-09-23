import { z } from "zod";

export class UserValidation {
  static readonly updateUserValidation = z.object({
    displayName: z.string().max(12).optional(),
    phoneNumber: z.string().max(12).optional(),
  });

  static readonly changePasswordPayload = z.object({
    newPassword: z.string().min(8),
  });
}