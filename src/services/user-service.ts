import { ResponseError } from "../helpers/response-error";
import { prisma } from "../libs/prisma";
import { UpdateUserPayload } from "../types/user-types";

export class UserService {
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

  static async createUserAddress(userId: number) {}
}
