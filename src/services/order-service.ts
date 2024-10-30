import { OrderStatus } from "./../../node_modules/.prisma/client/index.d";
import {
  applyDiscountVoucherStore,
  calculateShippingCost,
  calculateTotalPriceAndWeight,
  getCartItemsSelectedByStore,
  getExistStore,
  getUserAddress,
  mapStatusOrderToEnum,
} from "../helpers/order/order";
import { ResponseError } from "../helpers/response-error";
import { prisma } from "../libs/prisma";
import {
  ApplyDiscountVoucherPayload,
  CalculateOrderPerStorePayload,
  CreateOrderPayload,
} from "../types/order-types";
import { NextFunction, Response, text } from "express";
import dayjs from "dayjs";
import { createPaymentLink } from "../helpers/order/payment";

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
    let discountProducts = 0;
    let discountShipping = 0;
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
          discountProducts += fixedDiscountAmount;
        } else if (findVoucher.voucherType === "SHIPPING_COST") {
          fixedDiscountAmount = findVoucher.discount;
          payload.finalShippingCost! -= fixedDiscountAmount;
          discountShipping += fixedDiscountAmount;
        }
      case "PERCENT_DISCOUNT":
        let percentDiscountAmount;
        if (findVoucher.voucherType === "PRODUCT_PRICE") {
          percentDiscountAmount =
            (payload.finalProductsPrice / 100) * findVoucher.discount;
          payload.finalProductsPrice -= percentDiscountAmount;
          discountProducts += percentDiscountAmount;
        } else if (findVoucher.voucherType === "SHIPPING_COST") {
          percentDiscountAmount =
            (payload.finalShippingCost / 100) * findVoucher.discount;
          payload.finalShippingCost -= percentDiscountAmount;
          discountShipping += percentDiscountAmount;
        }
    }
    return {
      newProductsPrice: payload.finalProductsPrice,
      newFinalShippingCost: payload.finalShippingCost,
      discountProducts,
      discountShipping,
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
    let totalDiscountProducts = 0;
    let totalDiscountShipping = 0;
    let paymentLink;

    if (payload.ecommerceVoucherId) {
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
    }

    try {
      await prisma.$transaction(async (tx) => {
        const newOrder = await tx.order.create({
          data: {
            orderStatus: "WAITING_FOR_PAYMENT",
            shippingCost: 0,
            totalPayment: 0,
            totalPrice: 0,
            userId,
            note: payload.note,
          },
        });
        if (!newOrder) {
          throw new ResponseError(400, "cant create order");
        }
        for (const item of payload.orderStore) {
          const calculateOrderStore = await this.calculateOrderItemByStore(
            userId,
            item
          );

          finalProductsPrice! += calculateOrderStore.totalPrice;
          finalShippingCost! += calculateOrderStore.shipping.cost;
          totalDiscountProducts! += calculateOrderStore.discountStore;

          const addOrderstore = await tx.orderStore.create({
            data: {
              courier: item.courier,
              discount: calculateOrderStore.discountStore,
              service: item.service!,
              totalPrice: calculateOrderStore.totalPrice,
              orderId: newOrder.id,
              storeId: item.storeId,
              storeVoucherId: item.voucherId!,
            },
          });
          if (!addOrderstore) {
            throw new ResponseError(400, "cant add order store");
          }

          // decrement stock products
          for (const cartItem of calculateOrderStore.items) {
            await tx.product.update({
              where: {
                id: cartItem.productId,
              },
              data: {
                stock: { update: { amount: { decrement: cartItem.quantity } } },
              },
            });

            await tx.orderItem.create({
              data: {
                productId: cartItem.productId,
                quantity: cartItem.quantity,
                orderStoreId: addOrderstore.id,
              },
            });
          }
        }

        // apply discount ecommerce voucher
        if (payload.ecommerceVoucherId) {
          const {
            newFinalShippingCost,
            newProductsPrice,
            discountShipping,
            discountProducts,
          } = await this.applyDiscountVoucher({
            finalProductsPrice,
            finalShippingCost,
            orderItems: payload.orderStore,
            voucherId: payload.ecommerceVoucherId!,
          });
          (finalProductsPrice = newFinalShippingCost),
            (finalShippingCost = newProductsPrice),
            (totalDiscountProducts = discountProducts);
          totalDiscountShipping = discountShipping;
        }
        // get payment link
        const link = await createPaymentLink(
          newOrder.id,
          finalProductsPrice + finalShippingCost
        );
        // update the store
        await tx.order.update({
          where: {
            id: newOrder.id,
          },
          data: {
            discountProducts: totalDiscountProducts,
            discountShippingCost: totalDiscountShipping,
            shippingCost: finalShippingCost,
            totalPrice: finalProductsPrice,
            totalPayment: finalProductsPrice + finalShippingCost,
            paymentLink: link,
          },
        });

        // delete cart item
        const findCart = await tx.cart.findFirst({
          where: {
            userId,
          },
        });
        await tx.cartItem.deleteMany({
          where: {
            cartId: findCart!.id,
            isSelected: true,
          },
        });
        paymentLink = link;
      });
    } catch (e: any) {
      console.log(e);
      throw new ResponseError(500, e);
      // next(e);
    }
    return { paymentLink };
  }

  static async getOrder(userId: number, orderId: number) {
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        orderStore: {
          include: {
            orderItem: {
              include: { product: { include: { productImage: true } } },
            },
          },
        },
      },
    });
    if (!order) {
      throw new ResponseError(400, "order not found");
    } else if (order.userId !== userId) {
      throw new ResponseError(400, "you are not allowed of this resources");
    }
    return order;
  }

  static async getOrderByStatus(userId: number, status: string) {
    const orderStatus = mapStatusOrderToEnum(status);
    if (!orderStatus) {
      throw new ResponseError(401, `Invalid order status ${status}`);
    }
    console.log(orderStatus);
    const orders = await prisma.order.findMany({
      where: {
        orderStatus,
        userId,
      },
      include: {
        orderStore: {
          include: {
            orderItem: {
              include: { product: { include: { productImage: true } } },
            },
          },
        },
      },
    });
    if (orders.length === 0) {
      throw new ResponseError(404, "there is no order by the status");
    }
    return orders;
  }

  static async cancelOrder(userId: number, orderId: number) {
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: { orderStore: { include: { orderItem: true } } },
    });
    if (!order) {
      throw new ResponseError(404, "order not found");
    } else if (order.userId !== userId) {
      throw new ResponseError(
        403,
        "you does not have access of this resources"
      );
    } else if (order.orderStatus !== "WAITING_FOR_PAYMENT") {
      throw new ResponseError(400, "order cannot be cancel");
    }
    let orderItems = [];
    for (const orderStore of order.orderStore) {
      const orderItemsDb = await prisma.orderItem.findMany({
        where: {
          orderStoreId: orderStore.id,
        },
      });
      if (orderItemsDb.length === 0) {
        throw new ResponseError(
          404,
          `there is not order item with order Store id:${orderStore.id}`
        );
      }
      orderItems.push(...orderItemsDb);
    }

    const transaction = [
      // update status order
      prisma.order.update({
        where: { id: orderId },
        data: { orderStatus: "CANCELLED" },
      }),
      // return back stock item
      ...orderItems.flatMap((orderItem) => {
        return [
          prisma.stock.update({
            where: {
              productId: orderItem.productId,
            },
            data: {
              amount: { increment: orderItem.quantity },
            },
          }),
        ];
      }),
    ];
    await prisma.$transaction(transaction);
  }

  static async confirmOrder(userId: number, orderId: number) {
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });
    if (!order) {
      throw new ResponseError(404, "order not found");
    } else if (order.userId !== userId) {
      throw new ResponseError(
        403,
        "you does not have acceess of this resources"
      );
    } else if (order.orderStatus !== "DELIVERED") {
      throw new ResponseError(400, "order was not delivered");
    }

    const updateOrder = await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        orderStatus: "CONFIRMED",
      },
    });
    return updateOrder;
  }
}
