import { ResponseError } from "../helpers/response-error";
import { prisma } from "../libs/prisma";

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
}
