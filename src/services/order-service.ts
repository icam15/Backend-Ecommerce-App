import { CartItem } from "@prisma/client";
import {
  applyDiscountVoucherStore,
  calculateShippingCost,
  calculateTotalPriceAndWeight,
  getCartItemsSelectedByStore,
  getExistStore,
  getUserAddress,
} from "../helpers/order/order";
import { ResponseError } from "../helpers/response-error";
import { prisma } from "../libs/prisma";
import {
  ApplyDiscountVoucherPayload,
  CalculateOrderPerStorePayload,
  CreateOrderPayload,
} from "../types/order-types";
import { Response } from "express";
import dayjs from "dayjs";

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

  static async applyDiscountVoucher(payload: ApplyDiscountVoucherPayload) {
    let totalDiscount = 0;
    const findVoucher = await prisma.voucher.findUnique({
      where: {
        id: payload.voucherId,
      },
    });
    if (!findVoucher) {
      throw new ResponseError(400, "voucher not found");
    } else if (findVoucher.minOrderItem > payload.orderItems.length) {
      throw new ResponseError(400, "minimal order item is not sufficient");
    } else if (findVoucher.minOrderPrice > payload.finalProductsPrice) {
      throw new ResponseError(400, "minimal order price is not sufficient");
    } else if (dayjs(findVoucher.expireAt).isBefore(dayjs())) {
      throw new ResponseError(400, "expired voucher");
    } else if (findVoucher.isClaimable === false) {
      throw new ResponseError(400, "voucher is not claimable");
    } else if (findVoucher.storeId !== null) {
      throw new ResponseError(400, "voucher is store voucher type");
    }

    switch (findVoucher.discountType) {
      case "FIXED_DISCOUNT":
        let fixedDiscountAmount;
        if (findVoucher.voucherType === "PRODUCT_PRICE") {
          fixedDiscountAmount = findVoucher.discount;
          payload.finalProductsPrice! -= fixedDiscountAmount;
          totalDiscount += fixedDiscountAmount;
        } else if (findVoucher.voucherType === "SHIPPING_COST") {
          fixedDiscountAmount = findVoucher.discount;
          payload.finalShippingCost! -= fixedDiscountAmount;
          totalDiscount += fixedDiscountAmount;
        }
      case "PERCENT_DISCOUNT":
        let percentDiscountAmount;
        if (findVoucher.voucherType === "PRODUCT_PRICE") {
          percentDiscountAmount =
            (payload.finalProductsPrice / 100) * findVoucher.discount;
          payload.finalProductsPrice -= percentDiscountAmount;
          totalDiscount += percentDiscountAmount;
        } else if (findVoucher.voucherType === "SHIPPING_COST") {
          percentDiscountAmount =
            (payload.finalShippingCost / 100) * findVoucher.discount;
          payload.finalShippingCost -= percentDiscountAmount;
          totalDiscount += percentDiscountAmount;
        }
    }
    return {
      newProductsPrice: payload.finalProductsPrice,
      newFinalShippingCost: payload.finalShippingCost,
      totalDiscount,
    };
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
    const { cost, estimation, service, costs } = await calculateShippingCost(
      userAdddress.cityId,
      store.cityId,
      totalProductWeight,
      payload.courier.toLowerCase(),
      payload.service!
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
      costs: costs,
      shipping: {
        cost: cost,
        estimation: estimation,
        service: service,
      },
    };
  }

  static async createOrder(userId: number, payload: CreateOrderPayload) {
    let finalProductsPrice = 0;
    let finalShippingCost = 0;
    let totalDiscount = 0;
    for (const item of payload.orderStore) {
      const calculateOrderStore = await this.calculateOrderItemByStore(
        userId,
        item
      );
      finalProductsPrice! += calculateOrderStore.totalPrice;
      // finalShippingCost! += calculateOrderStore.shipping.cost;
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

      const {
        newFinalShippingCost,
        newProductsPrice,
        totalDiscount: discountVoucher,
      } = await this.applyDiscountVoucher({
        finalProductsPrice: finalProductsPrice,
        finalShippingCost: finalShippingCost,
        orderItems: payload.orderStore,
        voucherId: payload.ecommerceVoucherId,
      });
      finalProductsPrice = newProductsPrice;
      finalShippingCost = newFinalShippingCost;
      totalDiscount = discountVoucher;
    }
    return {
      finalProductsPrice,
      finalShippingCost,
      totalDiscount,
    };
  }

  // static async applyDiscountVoucher(payload: ApplyDiscountVoucherPayload) {
  //   let totalDiscount = 0;
  //   const findVoucher = await prisma.voucher.findUnique({
  //     where: {
  //       id: payload.voucherId,
  //     },
  //   });
  //   if (!findVoucher) {
  //     throw new ResponseError(400, "voucher not found");
  //   } else if (findVoucher.minOrderItem > payload.orderItems.length) {
  //     throw new ResponseError(400, "minimal order item is not sufficient");
  //   } else if (findVoucher.minOrderPrice > payload.finalProductsPrice) {
  //     throw new ResponseError(400, "minimal order price is not sufficient");
  //   } else if (dayjs(findVoucher.expireAt).isBefore(dayjs())) {
  //     throw new ResponseError(400, "expired voucher");
  //   } else if (findVoucher.isClaimable === false) {
  //     throw new ResponseError(400, "voucher is not claimable");
  //   } else if (findVoucher.storeId !== null) {
  //     throw new ResponseError(400, "voucher is store voucher type");
  //   }

  //   switch (findVoucher.discountType) {
  //     case "FIXED_DISCOUNT":
  //       let fixedDiscountAmount;
  //       if (findVoucher.voucherType === "PRODUCT_PRICE") {
  //         fixedDiscountAmount = findVoucher.discount;
  //         payload.finalProductsPrice! -= fixedDiscountAmount;
  //         totalDiscount += fixedDiscountAmount;
  //       } else if (findVoucher.voucherType === "SHIPPING_COST") {
  //         fixedDiscountAmount = findVoucher.discount;
  //         payload.finalShippingCost! -= fixedDiscountAmount;
  //         totalDiscount += fixedDiscountAmount;
  //       }
  //     case "PERCENT_DISCOUNT":
  //       let percentDiscountAmount;
  //       if (findVoucher.voucherType === "PRODUCT_PRICE") {
  //         percentDiscountAmount =
  //           (payload.finalProductsPrice / 100) * findVoucher.discount;
  //         payload.finalProductsPrice -= percentDiscountAmount;
  //         totalDiscount += percentDiscountAmount;
  //       } else if (findVoucher.voucherType === "SHIPPING_COST") {
  //         percentDiscountAmount =
  //           (payload.finalShippingCost / 100) * findVoucher.discount;
  //         payload.finalShippingCost -= percentDiscountAmount;
  //         totalDiscount += percentDiscountAmount;
  //       }
  //   }
  //   return {
  //     finalProductsPrice: payload.finalProductsPrice,
  //     finalShippingCost: payload.finalShippingCost,
  //     totalDiscount,
  //   };
  // }
}
