import { ResponseError } from "../helpers/response-error";
import { prisma } from "../libs/prisma";
import { CalculateOrderPerStorePayload } from "../types/order-types";

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

  static async calculateOrderItemByStore(
    userId: number,
    payload: CalculateOrderPerStorePayload
  ) {
    // get user main address
    // get exist store
    // get cart item selected by the store and check stock
    // sum all product price
    // calculate shipping cost with user address and store address
    // add discount if there is voucher store
  }
}
