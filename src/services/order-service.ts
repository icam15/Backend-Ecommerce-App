import { ResponseError } from "../helpers/response-error";
import { prisma } from "../libs/prisma";

export class OrderService {
  static async getCheckoutCart(userId: number) {
    const getCartUser = await prisma.cart.findFirst({
      where: {
        userId,
      },
    });
    if (!getCartUser) {
      throw new ResponseError(400, "cart not found");
    }
    const getSelectedCartItem = await prisma.cartItem.findMany({
      where: {
        cartId: getCartUser.id,
        isSelected: true,
      },
    });
    if (getSelectedCartItem.length === 0) {
      throw new ResponseError(400, "there are no selected cart item");
    }
    console.log(getSelectedCartItem);

    return getSelectedCartItem;
  }
}
