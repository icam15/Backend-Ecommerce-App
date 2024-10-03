import { z } from "zod";

export class ProductValidation {
  static readonly createProductValidation = z.object({
    name: z.string().min(5).max(50),
    description: z.string().max(500).optional(),
    weight: z.string(),
    price: z.number(),
    discountPrice: z.number().optional(),
    categoryId: z.number(),
    storeEtalaseId: z.number().optional(),
  });
}
