export type CreateStorePayload = {
  name: string;
  description?: string;
  cityName: string;
  provinceName: string;
  postalCode?: string;
  cityId: number;
  provinceId: number;
};

export type UpdateStorePayload = {
  name?: string;
  description?: string;
  postalCode?: string;
  provinceName?: string;
  cityName?: string;
  cityId?: number;
  provinceId?: number;
};
