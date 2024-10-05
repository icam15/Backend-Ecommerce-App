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

  static readonly updateProductValidation = z.object({
    name: z.string().min(5).max(50).optional(),
    description: z.string().max(500).optional(),
    weight: z.number().optional(),
    price: z.number().optional(),
    discountPrice: z.number().optional(),
    storeEtalaseId: z.number(),
    quantity: z.number().optional(),
  });
}
