import { CourierType } from "@prisma/client";
import { string, z } from "zod";

export class OrderValidation {
  static readonly calculateOrderItemsByStoreValidation = z.object({
    storeId: z.number(),
    service: z.string().optional(),
    courier: z.nativeEnum(CourierType),
    voucherId: z.number().optional(),
    note: z.string().optional(),
  });
  static readonly createOrderValidation = z.object({
    note: z.string().optional(),
    ecommerceVoucherId: z.number().optional(),
    orderStore: z.array(this.calculateOrderItemsByStoreValidation).min(1),
  });

  static readonly applyDiscountVoucherValidation = z.object({
    finalProductsPrice: z.number(),
    finalShippingCost: z.number(),
    orderItems: z.array(z.number()),
    voucherId: z.number(),
  });
}
