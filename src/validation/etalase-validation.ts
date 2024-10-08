import { z } from "zod";

export class EtalaseStoreValidation {
  static readonly createEtalaseValidation = z.object({
    name: z.string().max(20),
    storeId: z.number(),
  });

  static readonly updateEtalaseValidation = z.object({
    name: z.string().max(20),
    storeId: z.number(),
  });
}
