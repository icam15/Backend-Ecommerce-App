import { ResponseError } from "../helpers/response-error";
import { prisma } from "../libs/prisma";
import {
  AddCartItemPayload,
  SelectCartItemPayload,
  SelectCartItemsByStorePayload,
  UpdateCartItemPayload,
} from "../types/cart-types";

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
        storeId: findProductItem.storeId,
        weight: findProductItem.weight,
      },
    });
    return newCartItem;
  }

  static async updateCartItem(userId: number, payload: UpdateCartItemPayload) {
    // find cart user
    const userCart = await this.findCart(userId);

    // check exist cart item
    const existCartItem = await prisma.cartItem.findUnique({
      where: {
        id: payload.cartItemId,
      },
    });
    if (!existCartItem) {
      throw new ResponseError(400, "cart item not found");
    } else if (userCart.id !== existCartItem.id) {
      throw new ResponseError(400, "you does not have access of this cart");
    }

    // check exist product and available stock
    const existProduct = await prisma.product.findUnique({
      where: {
        id: existCartItem.productId,
      },
      include: { stock: true },
    });
    if (!existProduct) {
      throw new ResponseError(400, "product not found");
    } else if (!existProduct.stock || existProduct.stock.amount <= 0) {
      throw new ResponseError(400, "product does not have available stock");
    } else if (existProduct.stock.amount < payload.quantity) {
      throw new ResponseError(400, "Insufficient stock available");
    }

    // update cart item
    const updateCartItem = await prisma.cartItem.update({
      where: {
        id: existCartItem.id,
      },
      data: {
        quantity: existCartItem.quantity + payload.quantity,
      },
    });
    return updateCartItem;
  }

  static async selectCartItem(userId: number, payload: SelectCartItemPayload) {
    // get user cart
    const userCart = await this.findCart(userId);

    // check exist cart item and compare cart id user with exist cart item
    const existCartItem = await prisma.cartItem.findUnique({
      where: {
        id: payload.cartItemId,
      },
    });
    if (!existCartItem) {
      throw new ResponseError(400, "cart item not found");
    } else if (userCart.id !== existCartItem.cartId) {
      throw new ResponseError(400, "you does not have access of this cart");
    }

    // select cart item
    const selectCartItem = await prisma.cartItem.update({
      where: {
        id: existCartItem.id,
      },
      data: {
        isSelected: payload.isSelected,
      },
    });
    return selectCartItem;
  }

  static async selectAllCartItems(userId: number, isSelected: boolean) {
    // get cart user
    const userCart = await this.findCart(userId);

    // select all items in the cart
    const cartItems = await prisma.cartItem.updateMany({
      where: {
        cartId: userCart.id,
      },
      data: {
        isSelected: isSelected,
      },
    });
    if (!cartItems) {
      throw new ResponseError(400, "there are no any item in your cart");
    }
    return cartItems;
  }

  static async selectCartItemsByStore(
    userId: number,
    payload: SelectCartItemsByStorePayload
  ) {
    // get cart user
    const userCart = await this.findCart(userId);

    // select items in the cart by store
    const cartItemsByStore = await prisma.cartItem.updateMany({
      where: {
        cartId: userCart.id,
        storeId: payload.storeId,
      },
      data: {
        isSelected: payload.isSelected,
      },
    });
    if (!cartItemsByStore) {
      throw new ResponseError(
        400,
        "there are no any item by the store in your cart"
      );
    }
    return cartItemsByStore;
  }

  static async deleteCartItem(userId: number, cartItemId: number) {
    // get user cart
    const userCart = await this.findCart(userId);

    // exist Cart item
    const existCartItem = await prisma.cartItem.findUnique({
      where: {
        id: cartItemId,
        cartId: userCart.id,
      },
    });
    if (!existCartItem) {
      throw new ResponseError(400, "cart item not found");
    }

    // delet cart item
    const deleteCart = await prisma.cartItem.findUnique({
      where: {
        id: cartItemId,
        cartId: userCart.id,
      },
    });
    return deleteCart;
  }
}
