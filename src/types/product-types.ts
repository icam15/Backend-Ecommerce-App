export type CreateProductPayload = {
  name: string;
  description?: string;
  weight: number;
  price: number;
  discountPrice?: number;
  categoryId: number;
  storeEtalaseId?: number;
  quantity: number;
};

export type UpdateProductPayload = {
  name?: string;
  description?: string;
  weight?: number;
  price?: number;
  discountPrice?: number;
  storeEtalaseId?: number;
  quantity?: number;
};
