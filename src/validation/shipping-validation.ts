import { z } from "zod";

export class ShippingValidation {
  static readonly getShippingValidation = z.object({
    origin: z.number(),
    destination: z.number(),
    weight: z.number(),
    courier: z.string(),
  });
}
