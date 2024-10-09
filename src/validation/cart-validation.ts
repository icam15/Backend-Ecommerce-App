import { z } from "zod";

export class CartValidation {
  static readonly addCartItemValidation = z.object({
    quantity: z.number().min(-1),
    productId: z.number(),
  });
}
