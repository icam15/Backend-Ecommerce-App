export type CreateStorePayload = {
  name: string;
  description?: string;
  cityName: string;
  provinceName: string;
  postalCode?: string;
  cityId: number;
  provinceId: number;
};
