import { decode } from "base64-arraybuffer";
import { hashPassword } from "../helpers/bcrypt";
import { ResponseError } from "../helpers/response-error";
import { prisma } from "../libs/prisma";
import { ChangePasswordPayload, UpdateUserPayload } from "../types/user-types";
import { getUrlImageFromBucket, uploadImageToBucket } from "../utils/supabase";
import { logger } from "../libs/logger";

export class UserService {
  // get user from database
  static async getUserByid(userId: number) {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
        isVerified: "VERIFIED",
      },
      include: { userToken: true },
    });
    if (!user) {
      throw new ResponseError(404, "account not found");
    }
    return user;
  }

  static async UpdateUserById(userId: number, payload: UpdateUserPayload) {
    // check exist display name
    if (payload.displayName) {
      const existDisplayName = await prisma.user.findFirst({
        where: {
          displayName: payload.displayName,
        },
      });
      if (existDisplayName) {
        throw new ResponseError(400, "display name used by another user");
      }
    }

    // way one
    // let existDisplayName;
    // if (payload.displayName) {
    //   existDisplayName = await prisma.user.findFirst({
    //     where: {
    //       displayName: payload.displayName,
    //     },
    //   });
    // }
    // if (existDisplayName) {
    //   throw new ResponseError(400, "display name used by another user");
    // }

    // update user
    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        displayName: payload.displayName,
        phoneNumber: payload.phoneNumber,
      },
    });

    return user;
  }

  static async changePassword(userId: number, payload: ChangePasswordPayload) {
    // hash new password
    const newHashedPassword = await hashPassword(payload.newPassword);
    // update user with the new password
    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: newHashedPassword,
      },
    });
    return user;
  }

  static async updateImageUser(
    userId: number,
    image: Express.Multer.File
  ): Promise<void> {
    // decode file buffer to string base64 encoding and then decode base 64 to array buffer
    const base64Image = image.buffer.toString("base64");
    const arrayBufferImage = decode(base64Image);

    // upload image to bucket
    const originalFileName = image.originalname.split(".");
    const fileExt = originalFileName[originalFileName.length - 1].toLowerCase();
    const filePath = `${userId}-${Date.now()}.${fileExt}`;
    const { err } = await uploadImageToBucket(filePath, arrayBufferImage);
    if (err) {
      throw new ResponseError(400, err.message);
    }
    logger.debug(err);

    // get url image from bucket
    const { imageUrl } = await getUrlImageFromBucket(filePath);
    logger.debug(imageUrl);

    // attach image url to user in database
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        imageUrl,
      },
    });
  }

  static async getUserVouchers(userId: number) {
    const findUserVouchers = await prisma.userVoucher.findMany({
      where: {
        userId,
      },
      include: { voucher: true },
    });
    if (!findUserVouchers) {
      throw new ResponseError(400, "user does not any voucher");
    }

    return findUserVouchers;
  }
}
