import { ResponseError } from "./../helpers/response-error";
import { prisma } from "./../libs/prisma";
import {
  CreateProductPayload,
  UpdateProductPayload,
} from "../types/product-types";
import { decode } from "base64-arraybuffer";
import { getUrlImageFromBucket, uploadImageToBucket } from "../utils/supabase";
import { logger } from "../libs/logger";

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
      include: { stock: true },
    });
    if (!findProduct) {
      throw new ResponseError(400, "product not found");
    }
    return findProduct;
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

    logger.info(images);
    // create new product images
    if (images.length > 0) {
      images.forEach(async (image) => {
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
            storeId: newProduct.storeId,
          },
        });
      });
    }
    return newProduct;
  }

  static async updateProductData(
    userId: number,
    productId: number,
    payload: UpdateProductPayload
  ) {
    // check  if exist product
    const existProduct = await this.checkExistProduct(productId);

    // check  if valid admin
    const adminProduct = await this.checkAdminStore(userId);
    if (existProduct.storeId !== adminProduct.storeId) {
      throw new ResponseError(400, "you does not have access of this product");
    }

    // update product data
    await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        name: payload.name ? payload.name : existProduct.name,
        description: payload.description
          ? payload.description
          : existProduct.description,
        price: payload.price ? payload.price : existProduct.price,
        discountPrice: payload.discountPrice
          ? payload.discountPrice
          : existProduct.discountPrice,
        status: "PUBLISHED",
        storeEtalaseId: payload.storeEtalaseId
          ? payload.storeEtalaseId
          : existProduct.storeEtalaseId,
        weight: payload.weight ? payload.weight : existProduct.weight,
        stock: {
          update: {
            amount: payload.quantity
              ? payload.quantity
              : existProduct.stock?.amount,
          },
        },
      },
    });
  }

  static async updateProductImage(
    userId: number,
    productId: number,
    imageId: number,
    image: Express.Multer.File
  ) {
    // check exist product image
    const existProductImage = await prisma.productImage.findUnique({
      where: {
        id: imageId,
        productId,
      },
    });
    if (!existProductImage) {
      throw new ResponseError(400, "product image not found");
    }

    // check if valid admin
    const admin = await this.checkAdminStore(userId);
    if (admin.storeId !== existProductImage.storeId) {
      throw new ResponseError(400, "you does not have access of this product");
    }

    // update product image
    // decode file buffer to string base64 encoding and then decode base 64 to array buffer
    const base64Image = image.buffer.toString("base64");
    const arrayBufferImage = decode(base64Image);

    // upload image to bucket
    const originalFileName = image.originalname.split(".");
    const fileExt = originalFileName[originalFileName.length - 1].toLowerCase();
    const filePath = `${existProductImage.id}-${Date.now()}.${fileExt}`;
    const { err } = await uploadImageToBucket(filePath, arrayBufferImage);
    if (err) {
      throw new ResponseError(400, err.message);
    }
    // get url image from bucket
    const { imageUrl } = await getUrlImageFromBucket(filePath);
    await prisma.productImage.update({
      where: {
        id: imageId,
        productId,
      },
      data: {
        imageUrl,
      },
    });
  }

  static async getProductById(productId: number) {
    const findProduct = await prisma.product.findUnique({
      where: {
        id: productId,
      },
      include: { productImage: true, stock: true, store: true },
    });
    if (!findProduct) {
      throw new ResponseError(400, "product not found");
    }
    return findProduct;
  }

  static async deleteProduct(userId: number, productId: number) {
    // check exist product
    const existProuct = await this.checkExistProduct(productId);

    // check valid admin
    const admin = await this.checkAdminStore(userId);
    if (admin.storeId !== existProuct.storeId) {
      throw new ResponseError(400, "you does not have access of this product");
    }

    // delete using transaction
    await prisma.product.delete({
      where: { id: productId },
      include: { productImage: true, stock: true },
    });
  }

  static async setProductToInActive(userId: number, productId: number) {
    // check exist product
    const existProduct = await this.checkExistProduct(productId);

    // check valid admin
    const admin = await this.checkAdminStore(userId);
    if (admin.storeId !== existProduct.storeId) {
      throw new ResponseError(400, "your does not have access of this product");
    }

    // set product to inActive
    await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        status: "INACTIVE",
      },
    });
  }
}
