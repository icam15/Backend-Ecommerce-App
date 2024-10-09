export type AddCartItemPayload = {
  productId: number;
  quantity: string;
};

export type UpdateCartItemPayload = {
  cartItemId: number;
  quantity: number;
};
