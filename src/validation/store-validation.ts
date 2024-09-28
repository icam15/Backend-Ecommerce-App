import { z } from "zod";

export class StoreValidation {
  static readonly createStoreValidation = z.object({
    name: z.string().max(20),
    description: z.string().optional(),
    cityName: z.string(),
    provinceName: z.string(),
    postalCode: z.string().optional(),
    cityId: z.number(),
    provinceId: z.number(),
  });
}
