import { decode } from "base64-arraybuffer";
import { prisma } from "../libs/prisma";
import {
  AddStoreAdminPayload,
  CreateStorePayload,
  UpdateStorePayload,
} from "../types/store-types";
import { getUrlImageFromBucket, uploadImageToBucket } from "../utils/supabase";
import { ResponseError } from "../helpers/response-error";
import { logger } from "../libs/logger";

export class StoreService {
  static async createStore(userId: number, payload: CreateStorePayload) {
    // create new store
    const newStore = await prisma.store.create({
      data: {
        name: payload.name,
        description: payload.description!,
        cityName: payload.cityName,
        provinceName: payload.provinceName,
        cityId: payload.cityId,
        provinceId: payload.provinceId,
        postalCode: payload.postalCode!,
        userId,
      },
    });

    // update user to be a admin
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        role: "STOREADMIN",
        storeAdmin: { create: { storeId: newStore.id } },
      },
    });
    return newStore;
  }

  static async isOwnerStore(userId: number, storeId: number) {
    const ownerStore = await prisma.store.findUnique({
      where: {
        id: storeId,
        userId,
      },
    });
    if (!ownerStore) {
      throw new ResponseError(400, "you are not own this store");
    }
  }

  static async isStoreAdmin(userId: number, storeId: number) {
    const findAdmin = await prisma.storeAdmin.findFirst({
      where: {
        userId,
        storeId,
      },
    });
    if (!findAdmin) {
      throw new ResponseError(400, "you are not allowed to update this");
    }
    return findAdmin;
  }

  static async findStore(storeId: number) {
    const findStore = await prisma.store.findUnique({
      where: {
        id: storeId,
      },
    });
    if (!findStore) {
      throw new ResponseError(404, "store not found");
    }
    return findStore;
  }

  static async UpdateStoreImage(
    userId: number,
    storeId: number,
    image: Express.Multer.File
  ) {
    await this.isStoreAdmin(userId, storeId);

    // decode file buffer to string base64 encoding and then decode base 64 to arrayBuffer
    const base64Image = image.buffer.toString("base64");
    const arrayBufferImage = decode(base64Image);
    // upload image to bucket
    const originalFileName = image.originalname.split(".");
    const fileExt = originalFileName[originalFileName.length - 1].toLowerCase();
    const filePath = `${userId}-${Date.now()}.${fileExt}`;
    const { err } = await uploadImageToBucket(filePath, arrayBufferImage);
    if (err) {
      logger.debug(err);
      throw new ResponseError(400, err.message);
    }
    // get url image from bucket
    const { imageUrl } = await getUrlImageFromBucket(filePath);

    // attach image url to store in database
    await prisma.store.update({
      where: {
        id: storeId,
        userId: userId,
      },
      data: {
        imageUrl,
      },
    });
  }

  static async getStoreById(storeId: number) {
    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
      },
    });
    if (!store) {
      throw new ResponseError(400, "store not found");
    }
    return store;
  }

  static async updateStore(
    userId: number,
    storeId: number,
    payload: UpdateStorePayload
  ) {
    const {
      cityId,
      cityName,
      description,
      name,
      postalCode,
      provinceId,
      provinceName,
    } = payload;

    // find exist store admin
    await this.isStoreAdmin(userId, storeId);

    // find exist store
    const existStore = await this.findStore(storeId);

    // update the store
    await prisma.store.update({
      where: {
        id: storeId,
      },
      data: {
        name: name ? name : existStore.name,
        description: description ? description : existStore.description,
        cityId: cityId ? cityId : existStore.cityId,
        cityName: cityName ? cityName : existStore.cityName,
        postalCode: postalCode ? postalCode : existStore.postalCode,
        provinceId: provinceId ? provinceId : existStore.provinceId,
        provinceName: provinceName ? provinceName : existStore.provinceName,
      },
    });
  }

  static async deleteStore(userId: number, storeId: number) {
    // check if the user really own that store
    const isOwnerStore = await prisma.store.findUnique({
      where: {
        userId,
        id: storeId,
      },
    });
    if (!isOwnerStore) {
      throw new ResponseError(400, "your does not own this store");
    }
    // delete store admins
    await prisma.storeAdmin.deleteMany({
      where: {
        storeId,
      },
    });

    // delete the store
    await prisma.store.delete({
      where: {
        id: storeId,
        userId,
      },
    });
  }

  static async addStoreAdmin(
    userId: number,
    storeId: number,
    payload: AddStoreAdminPayload
  ) {
    // check if the user own the store
    await this.isOwnerStore(userId, storeId);

    // check if the new admin id already be a admin on the store
    const existAdmin = await prisma.storeAdmin.findFirst({
      where: {
        userId: payload.newAdminId,
        storeId,
      },
    });
    if (existAdmin) {
      throw new ResponseError(400, "user already be a admin");
    }

    // update role new Admin
    await prisma.user.update({
      where: {
        id: payload.newAdminId,
      },
      data: {
        role: "STOREADMIN",
      },
    });

    // add new admin to the store
    await prisma.storeAdmin.create({
      data: {
        storeId,
        userId: payload.newAdminId,
      },
    });
  }

  static async deleteStoreAdmin(
    userId: number,
    storeId: number,
    adminId: number
  ) {
    // check if the user own the store
    await this.isOwnerStore(userId, storeId);

    // check exist admin

    // delete admin from the store
  }

  static async getStoreAdminByid(
    userId: number,
    storeId: number,
    adminId: number
  ) {
    // check if the user own the store
    // get store admin
  }

  static async getStoreAdmins(userId: number, storeId: number) {
    // check if the user own the store
    // get all store admins
  }
}
