import { decode } from "base64-arraybuffer";
import { prisma } from "../libs/prisma";
import { CreateStorePayload, UpdateStorePayload } from "../types/store-types";
import { getUrlImageFromBucket, uploadImageToBucket } from "../utils/supabase";
import { ResponseError } from "../helpers/response-error";
import { logger } from "../libs/logger";

export class StoreService {
  static async createStore(userId: number, payload: CreateStorePayload) {
    // let url;
    // if (image !== null) {

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
    return newStore;
  }

  static async UpdateStoreImage(
    userId: number,
    storeId: number,
    image: Express.Multer.File
  ) {
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

  static async findStoreAdmin() {}

  static async updateStore(
    userId: number,
    storeId: number,
    payload: UpdateStorePayload
  ) {}
}
