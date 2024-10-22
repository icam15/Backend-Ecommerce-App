import { CourierType, ShippingServiceType } from "@prisma/client";
import { string, z } from "zod";

export class OrderValidation {
  static readonly calculateOrderItemsByStoreValidation = z.object({
    storeId: z.number(),
    service: z.nativeEnum(ShippingServiceType),
    courier: z.nativeEnum(CourierType),
    voucherId: z.string().optional(),
    note: z.string().optional(),
  });
}
