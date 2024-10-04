export type CreateProductPayload = {
  name: string;
  description?: string;
  weight: string;
  price: number;
  discountPrice?: string;
  categoryId: number;
  storeEtalaseId?: number;
  quantity: number;
};
