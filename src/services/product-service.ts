import { ResponseError } from "./../helpers/response-error";
import { prisma } from "./../libs/prisma";
import { CreateProductPayload } from "../types/product-types";
import { decode } from "base64-arraybuffer";
import { getUrlImageFromBucket, uploadImageToBucket } from "../utils/supabase";

export class ProductService {
  static async checkAdminStore(userId: number) {
    const adminStore = await prisma.storeAdmin.findFirst({
      where: {
        userId,
      },
    });
    if (!adminStore) {
      throw new ResponseError(400, "you are not an admin of the store");
    }
    return adminStore;
  }

  static async checkExistProduct(productId: number) {
    const findProduct = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });
    if (!findProduct) {
      throw new ResponseError(400, "product not found");
    }
  }

  static async createProduct(
    userId: number,
    images: Express.Multer.File[],
    payload: CreateProductPayload
  ) {
    // check if valid admin
    const admin = await this.checkAdminStore(userId);

    // create new product
    const newProduct = await prisma.product.create({
      data: {
        name: payload.name,
        price: payload.price,
        status: "PUBLISHED",
        weight: Number(payload.weight),
        categoryId: Number(payload.categoryId),
        storeId: admin.storeId,
        storeEtalaseId: payload.storeEtalaseId,
        stock: { create: { amount: payload.quantity, storeId: admin.storeId } },
      },
    });

    // create new product images
    if (images.length > 0) {
      for (const image of images) {
        async () => {
          // decode file buffer to string base64 encoding and then decode base 64 to array buffer
          const base64Image = image.buffer.toString("base64");
          const arrayBufferImage = decode(base64Image);

          // upload image to bucket
          const originalFileName = image.originalname.split(".");
          const fileExt =
            originalFileName[originalFileName.length - 1].toLowerCase();
          const filePath = `${newProduct.id}-${Date.now()}.${fileExt}`;
          const { err } = await uploadImageToBucket(filePath, arrayBufferImage);
          if (err) {
            throw new ResponseError(400, err.message);
          }
          // get url image from bucket
          const { imageUrl } = await getUrlImageFromBucket(filePath);
          await prisma.productImage.create({
            data: {
              imageUrl,
              productId: newProduct.id,
            },
          });
        };
      }
    }

    return newProduct;
  }
}
