import { decode } from "base64-arraybuffer";
import { prisma } from "../libs/prisma";
import {
  AddStoreAdminPayload,
  CreateStorePayload,
  DeleteStoreAdminPayload,
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

    // check if the new admin id already be a admin
    const existAdmin = await prisma.storeAdmin.findFirst({
      where: {
        userId: payload.newAdminId,
      },
    });
    if (existAdmin) {
      throw new ResponseError(400, "user already be an admin");
    }

    // update role new Admin and create new store admin
    await prisma.user.update({
      where: {
        id: payload.newAdminId,
      },
      data: {
        role: "STOREADMIN",
        storeAdmin: { create: { storeId } },
      },
    });

    // // add new admin to the store and update
    // await prisma.storeAdmin.create({
    //   data: {
    //     storeId,
    //     userId: payload.newAdminId,
    //   },
    // });
  }

  static async deleteStoreAdmin(
    userId: number,
    storeId: number,
    adminId: number
  ) {
    // check if the user own the store
    await this.isOwnerStore(userId, storeId);

    // check exist admin
    const existAdminInTheStore = await prisma.storeAdmin.findFirst({
      where: {
        userId: adminId,
        storeId,
      },
    });
    if (!existAdminInTheStore) {
      throw new ResponseError(400, "user is not an admin");
    }

    // delete admin from the store and update role admin
    await prisma.user.update({
      where: {
        id: adminId,
      },
      data: {
        role: "CUSTOMER",
        storeAdmin: { delete: { id: existAdminInTheStore.id } },
      },
    });
  }

  static async getStoreAdminByid(
    userId: number,
    storeId: number,
    adminId: number
  ) {
    // check if the user is admin of the store
    const adminStore = await this.isStoreAdmin(userId, storeId);
    if (!adminStore) {
      throw new ResponseError(400, "you does not allowed for this resources");
    }

    // get store admin
    const findAdmin = await prisma.storeAdmin.findFirst({
      where: {
        userId: adminId,
        storeId,
      },
      include: { user: true },
    });
    if (!findAdmin) {
      throw new ResponseError(400, "admin not found");
    }
    return findAdmin;
  }

  static async getStoreAdmins(userId: number, storeId: number) {
    // check if the user is admin of the store
    await this.isStoreAdmin(userId, storeId);

    // get all store admins
    const findAdmins = await prisma.storeAdmin.findMany({
      where: {
        storeId,
      },
      include: { user: true },
    });
    if (!findAdmins) {
      throw new ResponseError(400, "cant found any admin of the store");
    }
    return findAdmins;
  }

  static async getProductsBystore(storeId: number) {
    const findProducts = await prisma.product.findMany({
      where: {
        storeId,
      },
    });
    if (!findProducts) {
      throw new ResponseError(400, "there are no any product in this store");
    }
    return findProducts;
  }

  static async getEtalasesByStore(storeId: number) {
    const findEtalaseStore = await prisma.storeEtalase.findMany({
      where: {
        storeId,
      },
    });
    if (!findEtalaseStore) {
      throw new ResponseError(400, "there are no any etalase in this store");
    }
    return findEtalaseStore;
  }
}
