import { ResponseError } from "../helpers/response-error";
import { prisma } from "../libs/prisma";

export class CartServcie {
  static async createCart(userId: number) {
    const newCart = await prisma.cart.create({
      data: {
        userId,
      },
    });
    return newCart;
  }

  static async findCart(userId: number) {
    const existCart = await prisma.cart.findUnique({
      where: {
        userId,
      },
    });
    if (!existCart) {
      throw new ResponseError(400, "you does not have cart");
    }
  }

  static async getCartItems(userId: number) {
    // check exist cart
    const existCart = await prisma.cart.findUnique({
      where: {
        userId,
      },
      include: { cartItem: true },
    });
    if (!existCart) {
      throw new ResponseError(400, "you does not have cart");
    }
    if (!existCart.cartItem) {
      throw new ResponseError(400, "you does not have any cart item");
    }
    // return cart and cart item
    return existCart;
  }
}
