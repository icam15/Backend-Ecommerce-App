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
    // find exist user address
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
    // find exist user address
    const existUserAddress = await this.existAddress(userId, addressId);
    // update exist user address
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

  // static async findMainAddressUser(userId: number) {
  //   const findMainAddress = await prisma.address.findFirst({
  //     where: {
  //       userId,
  //       isMainAddress: true,
  //     },
  //   });
  //   if (!findMainAddress) {
  //     throw new ResponseError(400, "this account does not have any address");
  //   }
  // }

  static async setMainUserAddress(userId: number, addressId: number) {
    // find main user address and update to normal address
    const findMainAddress = await prisma.address.findFirst({
      where: {
        userId,
        isMainAddress: true,
      },
    });
    if (!findMainAddress) {
      throw new ResponseError(400, "this account does not have any address");
    }

    await prisma.address.update({
      where: {
        userId,
        isMainAddress: true,
        id: findMainAddress.id,
      },
      data: {
        isMainAddress: false,
      },
    });

    // update the address selected to main address
    await prisma.address.update({
      where: {
        userId,
        id: addressId,
      },
      data: {
        isMainAddress: true,
      },
    });
  }

  static async getUserAddress(userId: number, addressId: number) {
    // find user address
    const userAddress = await prisma.address.findFirst({
      where: {
        userId,
        id: addressId,
      },
    });
    if (!userAddress) {
      throw new ResponseError(400, "address is not found");
    }
    return userAddress;
  }

  static async deleteUserAddress(userId: number, addressId: number) {
    // find exist user address and check if that is main address
    const findExistAddress = await prisma.address.findFirst({
      where: {
        userId,
        id: addressId,
      },
    });
    if (findExistAddress?.isMainAddress === true) {
      throw new ResponseError(400, "you cant delete main address");
    }
    // delete the address
    await prisma.address.delete({
      where: {
        userId,
        id: addressId,
      },
    });
  }

  static async getAllUserAddress(userId: number) {
    // find all user address
    const findUserAddresses = await prisma.address.findMany({
      where: {
        userId,
      },
    });
    if (!findUserAddresses) {
      throw new ResponseError(400, "this user does not have any address");
    }
    return findUserAddresses;
  }
}
