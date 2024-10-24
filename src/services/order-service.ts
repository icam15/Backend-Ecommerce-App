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
import {
  CalculateOrderPerStorePayload,
  CreateOrderPayload,
} from "../types/order-types";
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
      userAdddress.cityId,
      store.cityId,
      totalProductWeight,
      payload.courier.toLowerCase(),
      payload.service
    );

    // add discount if there is voucher store
    let discount;
    if (payload.voucherId !== undefined) {
      const { discount: voucherDiscount } = await applyDiscountVoucherStore(
        totalProductPrice,
        userId,
        payload.voucherId,
        cartItems.length,
        payload.storeId
      );
      discount = voucherDiscount;
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

  static async createOrder(userId: number, payload: CreateOrderPayload) {
    let finalProductPrice = 0;
    let finalShippingCost = 0;
    let totalDiscount = 0;
    for (const item of payload.orderStore) {
      const calculateOrderStore = await this.calculateOrderItemByStore(
        userId,
        item
      );
      finalProductPrice! += calculateOrderStore.totalPrice;
      finalShippingCost! += calculateOrderStore.shipping.cost;
      totalDiscount! += calculateOrderStore.discountStore;
    }
    if (payload.ecommerceVoucherId !== undefined) {
      const isVoucherUser = await prisma.userVoucher.findFirst({
        where: {
          voucherId: payload.ecommerceVoucherId,
        },
        include: { voucher: true },
      });
      if (!isVoucherUser) {
        throw new ResponseError(400, "user does not own the voucher");
      } else if (!isVoucherUser.voucher) {
        throw new ResponseError(400, "voucher not found");
      }

      switch (isVoucherUser.voucher.discountType) {
        case "FIXED_DISCOUNT":
          let fixedDiscountAmount;
          if (isVoucherUser.voucher.voucherType === "PRODUCT_PRICE") {
            fixedDiscountAmount = isVoucherUser.voucher.discount;
            finalProductPrice! -= fixedDiscountAmount;
            totalDiscount += fixedDiscountAmount;
          } else if (isVoucherUser.voucher.voucherType === "SHIPPING_COST") {
            fixedDiscountAmount = isVoucherUser.voucher.discount;
            finalShippingCost! -= fixedDiscountAmount;
            totalDiscount += fixedDiscountAmount;
          }
        case "PERCENT_DISCOUNT":
          let percentDiscountAmount;
          if (isVoucherUser.voucher.voucherType === "PRODUCT_PRICE") {
            percentDiscountAmount =
              (finalProductPrice / 100) * isVoucherUser.voucher.discount;
            finalProductPrice -= percentDiscountAmount;
            totalDiscount += percentDiscountAmount;
          } else if (isVoucherUser.voucher.voucherType === "SHIPPING_COST") {
            percentDiscountAmount =
              (finalShippingCost / 100) * isVoucherUser.voucher.discount;
            finalShippingCost -= percentDiscountAmount;
            totalDiscount += percentDiscountAmount;
          }
      }
    }
    return {
      finalProductPrice,
      finalShippingCost,
      totalDiscount,
    };
  }
}
