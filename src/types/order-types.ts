export type CalculateOrderPerStorePayload = {
  storeId: number;
  service?: string;
  courier: string;
  voucherId?: number;
  note?: string;
};

export type ApplyDiscountVoucherPayload = {
  finalProductsPrice: number;
  finalShippingCost: number;
  orderItems: [];
  voucherId: number;
};

export type CreateOrderPayload = {
  note?: string;
  ecommerceVoucherId?: number;
  orderStore: CalculateOrderPerStorePayload[];
};
