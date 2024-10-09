export type AddCartItemPayload = {
  productId: number;
  quantity: string;
};

export type UpdateCartItemPayload = {
  cartItemId: number;
  quantity: number;
};

export type SelectCartItemPayload = {
  cartItemId: number;
  isSelected: boolean;
};

export type SelectCartItemsByStorePayload = {
  storeId: number;
  isSelected: boolean;
};
