import { CartItem } from "@prisma/client";
import {
  applyDiscountVoucherStore,
  calculateShippingCost,
  calculateTotalPriceAndWeight,
  getCartItemsSelectedByStore,
  getExistStore,
  getUserAddress,
} from "../helpers/order";
import { ResponseError } from "../helpers/response-error";
import { prisma } from "../libs/prisma";
import { CalculateOrderPerStorePayload } from "../types/order-types";
import { Response } from "express";

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
    const userAdddress = await getUserAddress(userId);

    // get exist store
    const store = await getExistStore(payload.storeId);

    // get cart item selected by the store and check stock
    const cartItems = await getCartItemsSelectedByStore(
      userId,
      payload.storeId
    );

    // calculate product price and product weight
    const {
      cartItems: items,
      totalProductPrice,
      totalProductWeight,
    } = await calculateTotalPriceAndWeight(cartItems);

    // calculate shipping cost with user address and store address
    const { cost, estimation } = await calculateShippingCost(
      501,
      114,
      totalProductWeight,
      payload.courier.toLowerCase(),
      payload.service
    );

    // add discount if there is voucher store
    let discount;
    if (payload.voucherId !== undefined) {
      const { discount: vouherDiscount } = await applyDiscountVoucherStore(
        totalProductPrice,
        userId,
        payload.storeId,
        cartItems.length,
        payload.storeId
      );
      discount = vouherDiscount;
    }

    return {
      items: cartItems,
      totalPrice: totalProductPrice,
      discountStore: discount || 0,
      shipping: {
        cost: cost,
        estimation: estimation + "day",
      },
    };
   
  }
}
