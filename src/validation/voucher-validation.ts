import { DiscountType, VoucherType } from "@prisma/client";
import { z } from "zod";

export class VoucherValidation {
  static readonly createVoucherValidation = z.object({
    name: z.string().max(255),
    discount: z.number().min(1),
    isClaimable: z.enum(["true", "false"]),
    voucherType: z.nativeEnum(VoucherType),
    discountType: z.nativeEnum(DiscountType),
    minOrderItem: z.number().min(1),
    minOrderPrice: z.number(),
    code: z.string().optional(),
    stock: z.number().min(1),
  });

  static readonly updateVoucherValidation = z.object({
    discount: z.number().min(0).optional(),
    isClaimable: z.enum(["true", "false"]).optional(),
    minOrderItem: z.number().min(1).optional(),
    minOrderPrice: z.number().min(0).optional(),
    code: z.string().optional(),
    stock: z.number().optional(),
  });

  static readonly assignVoucherValidation = z.object({
    voucherId: z.number(),
    toUserId: z.number(),
  });
}
