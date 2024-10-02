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

  static readonly updateStoreValidation = z.object({
    name: z.string().max(20).optional(),
    description: z.string().optional(),
    cityName: z.string().optional(),
    provinceName: z.string().optional(),
    postalCode: z.string().optional(),
    cityId: z.number().optional(),
    provinceId: z.number().optional(),
  });

  static readonly addStoreAdminValidation = z.object({
    newAdminId: z.number(),
  });

  static readonly deleteStoreAdminValidation = z.object({
    adminId: z.number(),
  });
}
