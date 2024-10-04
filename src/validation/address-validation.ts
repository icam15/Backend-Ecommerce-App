import { number, string, z } from "zod";

export class AddressValidation {
  static readonly createUserAddressValidation = z.object({
    address: z.string(),
    phone: z.string().max(12),
    note: z.string().optional(),
    cityName: z.string(),
    cityId: z.number(),
    provinceName: z.string(),
    provinceId: z.number(),
    postalCode: z.string(),
    longitude: z.string(),
    latitude: z.string(),
  });

  static readonly updateUserAddressValidation = z.object({
    note: z.string().optional(),
    address: z.string(),
    phone: z.string(),
    postalCode: z.string().optional(),
    cityId: z.number(),
    cityName: z.string(),
  });
}
