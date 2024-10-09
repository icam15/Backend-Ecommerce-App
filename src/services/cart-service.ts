import { ResponseError } from "../helpers/response-error";
import { prisma } from "../libs/prisma";
import { AddCartItemPayload } from "../types/cart-types";

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
    return existCart;
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

  static async addCartItem(userId: number, payload: AddCartItemPayload) {
    // check exist cart and create cart if there is no cart
    let cart = await this.findCart(userId);
    if (!cart) {
      cart = await this.createCart(userId);
    }

    const findProductItem = await prisma.product.findUnique({
      where: {
        id: payload.productId,
      },
      include: { stock: true },
    });
    if (!findProductItem) {
      throw new ResponseError(400, "product item not found");
    } else if (!findProductItem.stock || findProductItem.stock.amount <= 0) {
      throw new ResponseError(400, "product does not have available stock");
    } else if (findProductItem.stock.amount < Number(payload.quantity)) {
      throw new ResponseError(400, "Insufficient stock available");
    }

    // check exist cart item
    const existCartItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: payload.productId,
      },
    });
    if (existCartItem) {
      const updateCartItem = await prisma.cartItem.update({
        where: {
          id: existCartItem.id,
        },
        data: {
          quantity: existCartItem.quantity + Number(payload.quantity),
        },
      });
      return updateCartItem;
    }

    // add cart item to the cart
    const newCartItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        quantity: Number(payload.quantity),
        productId: findProductItem.id,
      },
    });
    return newCartItem;
  }
}
