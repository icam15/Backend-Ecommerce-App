import { decode } from "base64-arraybuffer";
import { prisma } from "../libs/prisma";
import { CreateStorePayload } from "../types/store-types";
import { getUrlImageFromBucket, uploadImageToBucket } from "../utils/supabase";
import { ResponseError } from "../helpers/response-error";

export class StoreService {
  static async createStore(userId: number, payload: CreateStorePayload) {
    // let url;
    // if (image !== null) {
    //   // decode file buffer to string base64 encoding and then decode base 64 to arrayBuffer
    //   const base64Image = image.buffer.toString("base64");
    //   const arrayBufferImage = decode(base64Image);

    //   // upload image to bucket
    //   const originalFileName = image.originalname.split(".");
    //   const fileExt =
    //     originalFileName[originalFileName.length - 1].toLowerCase();
    //   const filePath = `${userId}-${Date.now()}-${fileExt}`;
    //   const { err } = await uploadImageToBucket(filePath, arrayBufferImage);
    //   if (err) {
    //     throw new ResponseError(400, err.message);
    //   }

    //   // get url image from bucket
    //   const { imageUrl } = await getUrlImageFromBucket(fileExt);
    //   url = imageUrl;
    //   //   // attach image url to store in database
    //   //   await prisma.store.update({
    //   //     where: {
    //   //       id: newStore.id,
    //   //       userId: userId,
    //   //     },
    //   //     data: {
    //   //       imageUrl,
    //   //     },
    //   //   });
    // }
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
}
