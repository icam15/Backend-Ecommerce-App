import { CourierType, ShippingServiceType } from "@prisma/client";
import { string, z } from "zod";

export class OrderValidation {
  static readonly calculateOrderItemsByStoreValidation = z.object({
    storeId: z.number(),
    service: z.nativeEnum(ShippingServiceType),
    courier: z.nativeEnum(CourierType),
    voucherId: z.number().optional(),
    note: z.string().optional(),
  });
  static readonly createOrderValidation = z.object({
    note: z.string().optional(),
    ecommerceVoucherId: z.number().optional(),
    orderStore: z.array(this.calculateOrderItemsByStoreValidation).min(1),
  });
}
