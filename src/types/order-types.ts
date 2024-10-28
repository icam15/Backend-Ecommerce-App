import { UserRole, CartItem, Product, CourierType } from "@prisma/client";

export type CalculateOrderPerStorePayload = {
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

export type CreateOrderPayload = {
  note?: string;
  ecommerceVoucherId?: number;
  orderStore: CalculateOrderPerStorePayload[];
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
