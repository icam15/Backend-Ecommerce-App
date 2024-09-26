export type CreateUserAddressPayload = {
  address: string;
  phone: string;
  note?: string;
  cityName: string;
  cityId: number;
  provinceName: string;
  provinceId: number;
  postalCode: string;
  longitude: string;
  latitude: string;
};

export type UpdateUserAddressPayload = {
  note?: string;
  address: string;
  phone: string;
  postalCode?: string;
  longitude: string;
  latitude: string;
  cityId: number;
  cityName: string;
};
