import { boolean, z } from "zod";

export class CartValidation {
  static readonly addCartItemValidation = z.object({
    quantity: z.number().min(1),
    productId: z.number(),
  });

  static readonly udpateCartItemValidation = z.object({
    cartItemId: z.number(),
    quantity: z.number().min(-1),
  });

  static readonly selectCartItemValidation = z.object({
    cartItemId: z.number(),
    isSelected: z.boolean(),
  });

  static readonly selectCartItemsByStoreValidation = z.object({
    storeId: z.number(),
    isSelected: z.boolean(),
  });
}
