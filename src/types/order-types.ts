export type CalculateOrderPerStorePayload = {
  storeId: number;
  service: string;
  courier: string;
  voucherId?: string;
  note?: string;
};

export type CalculateOrderPerStoreResponse = {
  totalPrice: number;
  shippingCost: number;
  discount: number;
};
