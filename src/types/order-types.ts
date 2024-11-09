import { UserRole, CartItem, Product, CourierType } from "@prisma/client";

export type CalculateOrderPayload = {
  storeId: number;
  service?: string;
  courier: CourierType;
  voucherId?: number;
  note?: string;
};

export type ApplyDiscountVoucherPayload = {
  finalProductsPrice: number;
  finalShippingCost: number;
  orderItems: any;
  voucherId: number;
};

export type CreateWrapperOrderPayload = {
  note?: string;
  ecommerceVoucherId?: number;
  orderStore: CalculateOrderPayload[];
};

export type OrderItemTypes = {
  id: number;
  productId: number;
  cartId: number;
  storeId: number;
  quantity: number;
  weight: number;
  isSelected: boolean;
  createAt: string;
  updateAt: string;
  product: Product;
};

export type ChangeOrderStatusPayload = {
  orderStoreId: number;
  newStatus: string;
};

export type CancelOrderPayload = {
  orderStoreId: number;
  reason: string;
};
