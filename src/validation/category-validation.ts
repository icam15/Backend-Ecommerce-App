import { z } from "zod";

export class CategoryValidation {
  static readonly createCategoryValidation = z.object({
    name: z.string(),
    iconUrl: z.string(),
  });

  static readonly UpdateCategoryValidation = z.object({
    name: z.string().optional(),
    iconUrl: z.string().optional(),
  });
}
