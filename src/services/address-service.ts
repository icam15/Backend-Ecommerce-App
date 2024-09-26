import { ResponseError } from "../helpers/response-error";
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

  static async existAddress(userId: number, addressId: number) {
    const findAddress = await prisma.address.findFirst({
      where: {
        userId,
        id: addressId,
      },
    });
    if (!findAddress) {
      throw new ResponseError(400, "address not found");
    }
    return findAddress;
  }

  static async updateAddress(
    userId: number,
    addressId: number,
    payload: UpdateUserAddressPayload
  ) {
    const existUserAddress = await this.existAddress(userId, addressId);
    const updateAddress = await prisma.address.update({
      where: {
        userId,
        id: addressId,
      },
      data: {
        note: payload.note ? payload.note : existUserAddress.note,
        address: payload.address,
        phone: payload.phone,
        postalCode: payload.postalCode ? payload.note : existUserAddress.note,
        cityId: payload.cityId,
        cityName: payload.cityName,
      },
    });
    return updateAddress;
  }
}
