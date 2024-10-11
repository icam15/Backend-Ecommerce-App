import { playgrouping } from "googleapis/build/src/apis/playgrouping";
import { ResponseError } from "../helpers/response-error";
import { prisma } from "../libs/prisma";
import { CreateVoucherPayload } from "../types/voucher-types";
import { decode } from "base64-arraybuffer";
import { getUrlImageFromBucket, uploadImageToBucket } from "../utils/supabase";
import dayjs from "dayjs";

export class VoucherService {
  static async findEcommerceAdmin(userId: number) {
    const findEcommerceAdmin = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!findEcommerceAdmin) {
      throw new ResponseError(400, "ecommerce admin not found");
    } else if (findEcommerceAdmin.role !== "ECOMMERCEADMIN") {
      throw new ResponseError(400, "you are not ecommerce admin");
    }
    return findEcommerceAdmin;
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
}
