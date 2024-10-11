export type CreateVoucherPayload = {
  name: string;
  discount: number;
  isClaimable: string;
  voucherType: "PRODUCT_PRICE" | "SHIPPING_COST";
  discountType: "FIXED_DISCOUNT" | "PERCENT_DISCOUNT";
  minOrderItem: number;
  minOrderPrice: number;
  code?: string;
  stock: number;
};
