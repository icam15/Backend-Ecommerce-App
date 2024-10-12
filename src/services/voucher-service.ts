import { playgrouping } from "googleapis/build/src/apis/playgrouping";
import { ResponseError } from "../helpers/response-error";
import { prisma } from "../libs/prisma";
import {
  CreateVoucherPayload,
  UpdateVoucherPayload,
} from "../types/voucher-types";
import { decode } from "base64-arraybuffer";
import { getUrlImageFromBucket, uploadImageToBucket } from "../utils/supabase";
import dayjs from "dayjs";

export class VoucherService {
  static async findEcommerceAdmin(userId: number) {
    const findAdmin = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!findAdmin) {
      throw new ResponseError(400, "ecommerce admin not found");
    } else if (findAdmin.role !== "ECOMMERCEADMIN") {
      throw new ResponseError(400, "you are not ecommerce admin");
    }
    return findAdmin;
  }

  static async findStoreAdmin(userId: number) {
    const findAdmin = await prisma.storeAdmin.findUnique({
      where: {
        id: userId,
      },
    });
    if (!findAdmin) {
      throw new ResponseError(400, "admin store not found");
    }
    return findAdmin;
  }

  static async checkExistVoucher(voucherId: number) {
    const findVoucher = await prisma.voucher.findUnique({
      where: {
        id: voucherId,
      },
    });
    if (!findVoucher) {
      throw new ResponseError(400, "voucher not found");
    }
    return findVoucher;
  }

  static async createEcommerceVoucher(
    userId: number,
    payload: CreateVoucherPayload,
    image: Express.Multer.File
  ) {
    // check valid ecommerce admin
    const ecommerceAdmin = await this.findEcommerceAdmin(userId);
    if (payload.discountType === "PERCENT_DISCOUNT" && payload.discount > 100) {
      throw new ResponseError(
        400,
        "payload discount more than limit for percent voucher type "
      );
    }

    // decode file buffer to string base64 encoding and then decode base 64 to array buffer
    const base64Image = image.buffer.toString("base64");
    const arrayBufferImage = decode(base64Image);

    // upload image to bucket
    const originalFileName = image.originalname.split(".");
    const fileExt = originalFileName[originalFileName.length - 1].toLowerCase();
    const filePath = `${ecommerceAdmin.id}-voucher-${Date.now()}.${fileExt}`;
    const { err } = await uploadImageToBucket(filePath, arrayBufferImage);
    if (err) {
      throw new ResponseError(400, err.message);
    }
    // get url image from bucket
    const { imageUrl } = await getUrlImageFromBucket(filePath);

    // create new ecommerce voucher
    const isClaimable = payload.isClaimable.toLowerCase() === "true";
    const expireVoucher = dayjs().add(7, "day").toDate();
    const newEcommerceVoucher = await prisma.voucher.create({
      data: {
        name: payload.name,
        discount: payload.discount,
        discountType: payload.discountType,
        voucherType: payload.voucherType,
        imageUrl,
        isClaimable,
        code: payload.code,
        ecommerceAdminId: ecommerceAdmin.id,
        minOrderItem: payload.minOrderItem,
        minOrderPrice: payload.minOrderPrice,
        stock: payload.stock,
        expireAt: expireVoucher,
      },
    });
    return newEcommerceVoucher;
  }

  static async createStoreVoucher(
    userId: number,
    image: Express.Multer.File,
    payload: CreateVoucherPayload
  ) {
    // check valid store admin
    const storeAdmin = await this.findStoreAdmin(userId);

    // validate voucher type percent with payload discount
    if (payload.discountType === "PERCENT_DISCOUNT" && payload.discount > 100) {
      throw new ResponseError(
        400,
        "payload discount more than limit for percent voucher type "
      );
    }
    // upload image to bucket
    // decode file buffer to string base64 encoding and then decode base 64 to array buffer
    const base64Image = image.buffer.toString("base64");
    const arrayBufferImage = decode(base64Image);

    // upload image to bucket
    const originalFileName = image.originalname.split(".");
    const fileExt = originalFileName[originalFileName.length - 1].toLowerCase();
    const filePath = `${storeAdmin.storeId}-voucher-${Date.now()}.${fileExt}`;
    const { err } = await uploadImageToBucket(filePath, arrayBufferImage);
    if (err) {
      throw new ResponseError(400, err.message);
    }
    // get url image from bucket
    const { imageUrl } = await getUrlImageFromBucket(filePath);

    // create store voucher
    const isClaimable = payload.isClaimable.toLowerCase() === "true";
    const expireVoucher = dayjs().add(7, "day").toDate();
    const newStoreVoucer = await prisma.voucher.create({
      data: {
        discount: payload.discount,
        discountType: payload.discountType,
        imageUrl,
        isClaimable,
        name: payload.name,
        stock: payload.stock,
        voucherType: payload.voucherType,
        storeAdminId: storeAdmin.id,
        code: payload.code,
        minOrderItem: payload.minOrderItem,
        minOrderPrice: payload.minOrderPrice,
        expireAt: expireVoucher,
        storeId: storeAdmin.storeId,
      },
    });
    return newStoreVoucer;
  }

  static async getVoucher(voucherId: number) {
    const findVoucher = await prisma.voucher.findUnique({
      where: {
        id: voucherId,
      },
    });
    if (!findVoucher) {
      throw new ResponseError(400, "voucher not found");
    }
    return findVoucher;
  }

  static async updateEcommerceVoucherData(
    userId: number,
    voucherId: number,
    payload: UpdateVoucherPayload
  ) {
    // check valid ecommerce admin
    await this.findEcommerceAdmin(userId);

    // check exist voucher
    const existVoucher = await this.checkExistVoucher(voucherId);
    if (existVoucher.ecommerceAdminId === null) {
      throw new ResponseError(400, "this voucher is not ecommerce voucher");
    }

    // validate if voucher percent type
    if (
      existVoucher.discountType === "PERCENT_DISCOUNT" &&
      payload.discount! > 100
    ) {
      throw new ResponseError(
        400,
        "new discount more than limit for percent voucher type"
      );
    }

    // update voucher
    const isClaimable = payload.isClaimable?.toLowerCase() === "true";
    const updateVoucher = await prisma.voucher.update({
      where: {
        id: voucherId,
      },
      data: {
        discount: payload.discount ?? existVoucher.discount,
        isClaimable: isClaimable ?? existVoucher.isClaimable,
        minOrderItem: payload.minOrderItem ?? existVoucher.minOrderItem,
        minOrderPrice: payload.minOrderPrice ?? existVoucher.minOrderPrice,
        code: payload.code ?? existVoucher.code,
        stock: payload.stock ?? existVoucher.stock,
      },
    });
    return updateVoucher;
  }

  static async updateStoreVoucherData(
    userId: number,
    voucherId: number,
    payload: UpdateVoucherPayload
  ) {
    // check exist voucher
    const existVoucher = await this.checkExistVoucher(voucherId);

    // check valid admin store
    const storeAdmin = await this.findStoreAdmin(userId);
    if (existVoucher.storeId !== storeAdmin.storeId) {
      throw new ResponseError(400, "you does not have access of this voucher");
    }

    // validate discount payload if the voucher is PERCENT_TYPE
    if (
      existVoucher.discountType === "PERCENT_DISCOUNT" &&
      payload.discount! > 100
    ) {
      throw new ResponseError(
        400,
        "new discount more than limit for percent voucher type"
      );
    }

    // update store voucher data
    const isClaimable = payload.isClaimable?.toLowerCase() === "true";
    const updateVoucher = await prisma.voucher.update({
      where: {
        id: voucherId,
      },
      data: {
        discount: payload.discount ?? existVoucher.discount,
        isClaimable,
        minOrderItem: payload.minOrderItem ?? existVoucher.minOrderItem,
        minOrderPrice: payload.minOrderPrice ?? existVoucher.minOrderPrice,
        code: payload.code ?? existVoucher.code,
        stock: payload.stock ?? existVoucher.stock,
      },
    });
    return updateVoucher;
  }

  static async deleteEcommerceVoucher(userId: number, voucherId: number) {
    // check exist voucher
    const existVoucher = await this.checkExistVoucher(voucherId);
    // check valid ecomerce voucher
    const ecommerceAdmin = await this.findEcommerceAdmin(userId);

    if (!existVoucher.ecommerceAdminId) {
      throw new ResponseError(400, "voucher is not type of ecommerce voucher");
    } else if (existVoucher.ecommerceAdminId !== ecommerceAdmin.id) {
      throw new ResponseError(400, "you does not have acces of this resources");
    }

    // delete voucher
    await prisma.voucher.delete({
      where: {
        id: voucherId,
      },
    });
  }

  static async deleteStoreVoucher(userId: number, voucherId: number) {
    // check exist voucher
    const existVoucher = await this.checkExistVoucher(voucherId);

    // check valid store admin
    const storeAdmin = await this.findStoreAdmin(userId);
    if (storeAdmin.id !== existVoucher.storeAdminId) {
      throw new ResponseError(400, "you does not have access of this voucher");
    }

    // delete voucher
    await prisma.voucher.delete({
      where: {
        id: voucherId,
      },
    });
  }
}
