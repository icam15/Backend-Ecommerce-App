import { decode } from "base64-arraybuffer";
import { ResponseError } from "../helpers/response-error";
import { prisma } from "../libs/prisma";
import {
  CreateEtalaseStorePayload,
  UpdateEtalaseStorePayload,
} from "../types/etalase-types";
import { getUrlImageFromBucket, uploadImageToBucket } from "../utils/supabase";

export class EtalaseService {
  static async checkIsAdmin(userId: number) {
    const findAdmin = await prisma.storeAdmin.findFirst({
      where: {
        userId,
      },
    });
    if (!findAdmin) {
      throw new ResponseError(400, "you are not an admin");
    }
    return findAdmin;
  }

  static async checkExistEtalaseStore(storeId: number, etalaseId: number) {
    const existEtalase = await prisma.storeEtalase.findFirst({
      where: {
        id: etalaseId,
        storeId,
      },
    });
    if (!existEtalase) {
      throw new ResponseError(400, "etalase not found");
    }
    return existEtalase;
  }

  static async createEtalaseStore(
    userId: number,
    icon: Express.Multer.File,
    payload: CreateEtalaseStorePayload
  ) {
    // check if valid admin
    const admin = await this.checkIsAdmin(userId);
    console.log(admin.storeId, payload.storeId);
    if (admin.storeId !== payload.storeId) {
      throw new ResponseError(400, "you does not have access of this store");
    }

    // upload icon to bucket and get the url
    // decode file buffer to string base64 encoding and then decode base 64 to array buffer
    const base64Image = icon.buffer.toString("base64");
    const arrayBufferIcon = decode(base64Image);

    // upload image to bucket
    const originalFileName = icon.originalname.split(".");
    const fileExt = originalFileName[originalFileName.length - 1].toLowerCase();
    const filePath = `${payload.storeId}-iconEtalase-${Date.now()}.${fileExt}`;
    const { err } = await uploadImageToBucket(filePath, arrayBufferIcon);
    if (err) {
      throw new ResponseError(400, err.message);
    }
    // get url image from bucket
    const { imageUrl } = await getUrlImageFromBucket(filePath);

    // create etalase store
    const newEtalaseStore = await prisma.storeEtalase.create({
      data: {
        name: payload.name,
        iconUrl: imageUrl,
        storeId: payload.storeId,
      },
    });
    return newEtalaseStore;
  }

  static async updateEtalaseStore(
    userId: number,
    etalaseId: number,
    icon: Express.Multer.File,
    payload: UpdateEtalaseStorePayload
  ) {
    // check exist etalase store
    const existEtalase = await this.checkExistEtalaseStore(
      payload.storeId,
      etalaseId
    );
    // check if valid admin
    const admin = await this.checkIsAdmin(userId);
    if (admin.storeId !== existEtalase.storeId) {
      throw new ResponseError(400, "you does not have access of this store");
    }
    // if there is new icon and then upload icon to bucket and get the url
    let iconUrl;
    if (icon) {
      // decode file buffer to string base64 encoding and then decode base 64 to array buffer
      const base64Image = icon.buffer.toString("base64");
      const arrayBufferIcon = decode(base64Image);

      // upload image to bucket
      const originalFileName = icon.originalname.split(".");
      const fileExt =
        originalFileName[originalFileName.length - 1].toLowerCase();
      const filePath = `${
        payload.storeId
      }-iconEtalase-${Date.now()}.${fileExt}`;
      const { err } = await uploadImageToBucket(filePath, arrayBufferIcon);
      if (err) {
        throw new ResponseError(400, err.message);
      }
      // get url image from bucket
      const { imageUrl } = await getUrlImageFromBucket(filePath);
      iconUrl = imageUrl;
    }
    // update etalase store
    await prisma.storeEtalase.update({
      where: {
        id: etalaseId,
      },
      data: {
        name: payload.name,
        iconUrl,
      },
    });
  }
  static async getEtalaseByStoreId(storeId: number) {
    const findStoreEtalases = await prisma.storeEtalase.findMany({
      where: {
        storeId,
      },
    });
    if (!findStoreEtalases) {
      throw new ResponseError(400, "there are no any etalase in this store");
    }
    return findStoreEtalases;
  }
}
