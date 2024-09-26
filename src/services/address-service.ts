import { prisma } from "../libs/prisma";
import {
  CreateUserAddressPayload,
  UpdateUserAddressPayload,
} from "../types/address-types";

export class AddressService {
  static async createUserAddress(
    payload: CreateUserAddressPayload,
    userId: number
  ) {
    // find main user address
    const existMainAddress = await prisma.address.findFirst({
      where: { userId, isMainAddress: true },
    });
    // create user address and set main address if there is no main address
    const address = await prisma.address.create({
      data: {
        userId,
        address: payload.address,
        cityId: payload.cityId,
        note: payload.note!,
        phone: payload.phone,
        postalCode: payload.postalCode,
        longitude: parseFloat(payload.longitude),
        latitude: parseFloat(payload.latitude),
        cityName: payload.cityName,
        provinceName: payload.cityName,
        provinceId: payload.provinceId,
        isMainAddress: existMainAddress !== null ? false : true,
      },
    });
    return address;
  }

  static async updateAddress(
    userId: number,
    addressId: number,
    payload: UpdateUserAddressPayload
  ) {
    const updateAddress = await prisma.address.update({
      where: {
        userId,
        id: addressId,
      },
      data: {
        note: payload.note,
        address: payload.address,
        phone: payload.phone,
        postalCode: payload.postalCode,
      },
    });
  }
}
