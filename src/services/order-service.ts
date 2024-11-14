import {
  applyDiscountVoucherStore,
  calculateShippingCost,
  calculateTotalPriceAndWeight,
  cancelOrder,
  getCartItemsSelectedByStore,
  getExistStore,
  getUserAddress,
  mapStatusOrderToEnum,
} from "../helpers/order/order";
import { ResponseError } from "../helpers/response-error";
import { prisma } from "../libs/prisma";
import {
  ApplyDiscountVoucherPayload,
  CalculateOrderPayload,
  CancelOrderPayload,
  ChangeOrderStatusPayload,
  CreateWrapperOrderPayload,
} from "../types/order-types";
import { NextFunction, Response, text } from "express";
import dayjs from "dayjs";
import { createPaymentLink } from "../helpers/order/payment";
import { decode } from "base64-arraybuffer";
import { getUrlImageFromBucket, uploadImageToBucket } from "../utils/supabase";
import { OrderStatus } from "@prisma/client";

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

  static async applyDiscountVoucher(
    userId: number,
    payload: ApplyDiscountVoucherPayload
  ) {
    let discountProducts = 0;
    let discountShipping = 0;

    const isVoucherUser = await prisma.userVoucher.findFirst({
      where: {
        voucherId: payload.voucherId,
        userId,
      },
      include: { voucher: true },
    });
    if (!isVoucherUser) {
      throw new ResponseError(400, "user does not own the voucher");
    } else if (!isVoucherUser.voucher) {
      throw new ResponseError(400, "voucher not found");
    }

    if (!isVoucherUser.voucher) {
      throw new ResponseError(400, "voucher not found");
    } else if (isVoucherUser.voucher.minOrderItem > payload.orderItems.length) {
      throw new ResponseError(400, "minimal order item is not sufficient");
    } else if (
      isVoucherUser.voucher.minOrderPrice > payload.finalProductsPrice
    ) {
      throw new ResponseError(400, "minimal order price is not sufficient");
    } else if (dayjs(isVoucherUser.voucher.expireAt).isBefore(dayjs())) {
      throw new ResponseError(400, "expired voucher");
    } else if (isVoucherUser.voucher.isClaimable === false) {
      throw new ResponseError(400, "voucher is not claimable");
    } else if (isVoucherUser.voucher.storeId !== null) {
      throw new ResponseError(400, "voucher is store voucher type");
    }

    switch (isVoucherUser.voucher.discountType) {
      case "FIXED_DISCOUNT":
        let fixedDiscountAmount;
        if (isVoucherUser.voucher.voucherType === "PRODUCT_PRICE") {
          fixedDiscountAmount = isVoucherUser.voucher.discount;
          discountProducts += fixedDiscountAmount;
        } else if (isVoucherUser.voucher.voucherType === "SHIPPING_COST") {
          fixedDiscountAmount = isVoucherUser.voucher.discount;
          payload.finalShippingCost! -= fixedDiscountAmount;
          discountShipping += fixedDiscountAmount;
        }
        break;

      case "PERCENT_DISCOUNT":
        let percentDiscountAmount;
        if (isVoucherUser.voucher.voucherType === "PRODUCT_PRICE") {
          percentDiscountAmount =
            (payload.finalProductsPrice / 100) * isVoucherUser.voucher.discount;
          discountProducts += percentDiscountAmount;
        } else if (isVoucherUser.voucher.voucherType === "SHIPPING_COST") {
          percentDiscountAmount =
            (payload.finalShippingCost / 100) * isVoucherUser.voucher.discount;
          discountShipping += percentDiscountAmount;
        }
        break;
    }
    return {
      discountProducts,
      discountShipping,
      usedUserVoucher: isVoucherUser.voucher,
    };
  }

  static async calculateOrderItemsByStore(
    userId: number,
    payload: CalculateOrderPayload
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
      501,
      114,
      totalProductWeight,
      payload.courier.toLowerCase(),
      payload.service!
    );

    // add discount if there is voucher store
    let discount;
    let userVoucher;
    if (payload.voucherId !== undefined) {
      const { discount: voucherDiscount, userVoucher: usedUserVoucher } =
        await applyDiscountVoucherStore(
          totalProductPrice,
          userId,
          payload.voucherId,
          cartItems.length,
          payload.storeId
        );
      discount = voucherDiscount;
      userVoucher = usedUserVoucher;
    }

    return {
      items: cartItems,
      totalPrice: totalProductPrice,
      discountStore: discount || 0,
      usedUserVoucher: userVoucher,
      costs: costs,
      shipping: {
        cost: cost,
        estimation: estimation,
        service: service,
      },
    };
  }

  static async createOrder(userId: number, payload: CreateWrapperOrderPayload) {
    let finalProductsPrice = 0;
    let finalShippingCost = 0;
    let totalDiscountProducts = 0;
    let totalDiscountShipping = 0;
    let paymentLink;

    try {
      await prisma.$transaction(async (tx) => {
        const addWrapperOrder = await tx.wrapperOrder.create({
          data: {
            orderStatus: "WAITING_FOR_PAYMENT",
            shippingCost: 0,
            totalPayment: 0,
            totalPrice: 0,
            userId,
            note: payload.note,
          },
        });
        if (!addWrapperOrder) {
          throw new ResponseError(400, "cant create order");
        }
        for (const item of payload.orderStore) {
          const calculateOrderStore = await this.calculateOrderItemsByStore(
            userId,
            item
          );

          finalProductsPrice! += calculateOrderStore.totalPrice;
          finalShippingCost! += calculateOrderStore.shipping.cost;
          totalDiscountProducts! += calculateOrderStore.discountStore;

          const addOrderstore = await tx.order.create({
            data: {
              courier: item.courier,
              discount: calculateOrderStore.discountStore,
              service: item.service!,
              totalPrice: calculateOrderStore.totalPrice,
              wrapperOrderId: addWrapperOrder.id,
              storeId: item.storeId,
              storeVoucherId: item.voucherId!,
              userId,
            },
          });
          if (!addOrderstore) {
            throw new ResponseError(400, "cant add order store");
          }

          if (
            calculateOrderStore.discountStore !== 0 &&
            calculateOrderStore.usedUserVoucher!.id
          ) {
            await tx.userVoucher.update({
              where: {
                id: calculateOrderStore.usedUserVoucher?.id,
                userId,
                voucherId: item.voucherId,
              },
              data: {
                isUsed: true,
              },
            });
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
                orderId: addOrderstore.id,
                productId: cartItem.productId,
                quantity: cartItem.quantity,
              },
            });
          }
        }

        // apply discount ecommerce voucher
        if (payload.ecommerceVoucherId) {
          const { discountShipping, discountProducts, usedUserVoucher } =
            await this.applyDiscountVoucher(userId, {
              finalProductsPrice,
              finalShippingCost,
              orderItems: payload.orderStore,
              voucherId: payload.ecommerceVoucherId!,
            });
          totalDiscountProducts = totalDiscountProducts + discountProducts;
          totalDiscountShipping = totalDiscountShipping + discountShipping;

          // update voucher is used
          await tx.userVoucher.update({
            where: {
              id: usedUserVoucher.id,
            },
            data: {
              isUsed: true,
            },
          });
        }
        // get payment link
        const link = await createPaymentLink(
          addWrapperOrder.id,
          finalProductsPrice + finalShippingCost
        );

        // update the store
        await tx.wrapperOrder.update({
          where: {
            id: addWrapperOrder.id,
          },
          data: {
            discountProducts: totalDiscountProducts,
            discountShippingCost: totalDiscountShipping,
            shippingCost: finalShippingCost - totalDiscountShipping,
            totalPrice: finalProductsPrice - totalDiscountProducts,
            totalPayment:
              finalProductsPrice +
              finalShippingCost -
              totalDiscountProducts -
              totalDiscountShipping,
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
        orderItem: {
          include: { product: { include: { productImage: true } } },
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

    const orders = await prisma.order.findMany({
      where: {
        userId,
        orderStatus: orderStatus,
      },
      include: {
        orderItem: {
          include: { product: { include: { productImage: true } } },
        },
      },
    });
    if (orders.length === 0) {
      throw new ResponseError(400, "order not found");
    }
    return orders;
  }

  static async cancelOrder(userId: number, orderId: number) {
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        wrapperOrder: true,
        orderItem: true,
      },
    });
    if (!order) {
      throw new ResponseError(404, "order not found");
    } else if (order.userId !== userId) {
      throw new ResponseError(
        400,
        "you does not have access of this resources"
      );
    }
    if (order.orderStatus !== "WAITING_FOR_PAYMENT") {
      throw new ResponseError(400, "order cannot be canceled");
    } else if (order.wrapperOrder.paymentProof) {
      throw new ResponseError(
        400,
        "order cannot be canceled because payment proof was uploaded"
      );
    }
    const updateOrder = await cancelOrder(order.id, order.orderItem);
    return updateOrder;
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

  static async uploadPaymentProof(
    userId: number,
    wrapperOrderId: number,
    file: Express.Multer.File
  ) {
    const order = await prisma.wrapperOrder.findUnique({
      where: {
        id: wrapperOrderId,
      },
    });
    if (!order) {
      throw new ResponseError(404, "order not found");
    } else if (order.userId !== userId) {
      throw new ResponseError(
        403,
        "you does not have access of this resources"
      );
    } else if (order.paymentProof) {
      throw new ResponseError(400, "payment proof was uploaded");
    }

    const base64File = file.buffer.toString("base64");
    const arrayBufferFile = decode(base64File);

    // upload image to bucket
    const originalFileName = file.originalname.split(".");
    const fileExt = originalFileName[originalFileName.length - 1].toLowerCase();
    const filePath = `${order.id}-${Date.now()}.${fileExt}`;
    const { err } = await uploadImageToBucket(filePath, arrayBufferFile);
    if (err) {
      throw new ResponseError(400, `${err.name}:${err.message}`);
    }
    // get url file from bucket
    const { imageUrl: fileUrl } = await getUrlImageFromBucket(filePath);
    const updateOrder = await prisma.wrapperOrder.update({
      where: {
        id: wrapperOrderId,
      },
      data: {
        paymentProof: fileUrl,
      },
    });
    return updateOrder;
  }

  static async checkAdminStoreByOrderStore(userId: number, orderId: number) {
    const admin = await prisma.storeAdmin.findFirst({
      where: {
        userId,
      },
    });
    if (!admin) {
      throw new ResponseError(404, "admin not found");
    }
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: { orderItem: true },
    });
    if (!order) {
      throw new ResponseError(404, "order not found");
    } else if (order.storeId !== admin.storeId) {
      throw new ResponseError(400, "you are not allowwed of this service");
    }
    return { order };
  }

  static async updateOrderStateByAdminStore(
    userId: number,
    payload: ChangeOrderStatusPayload
  ) {
    const newStatus = payload.newStatus as OrderStatus;
    const { order } = await this.checkAdminStoreByOrderStore(
      userId,
      payload.orderStoreId
    );

    if (
      !Object.values(OrderStatus).includes(payload.newStatus as OrderStatus)
    ) {
      throw new ResponseError(400, `invalid status:${payload.newStatus}`);
    }

    const allowwedTransitionStatus: { [key in OrderStatus]: OrderStatus[] } = {
      [OrderStatus.WAITING_FOR_PAYMENT]: [],
      [OrderStatus.WAITING_FOR_CONFIRMATION]: [],
      [OrderStatus.PROCESS]: [OrderStatus.SHIPPING],
      [OrderStatus.SHIPPING]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CONFIRMED]: [],
      [OrderStatus.CANCELLED]: [],
    };
    if (!allowwedTransitionStatus[order.orderStatus].includes(newStatus)) {
      throw new ResponseError(
        400,
        `unsupported transition order status to ${newStatus}`
      );
    }

    return await prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        orderStatus: newStatus,
      },
    });
  }

  static async cancelOrderByAdminStore(
    userId: number,
    payload: CancelOrderPayload
  ) {
    const { order } = await this.checkAdminStoreByOrderStore(
      userId,
      payload.orderStoreId
    );
    if (
      order.orderStatus === OrderStatus.SHIPPING ||
      order.orderStatus === OrderStatus.DELIVERED ||
      order.orderStatus === OrderStatus.CONFIRMED
    ) {
      throw new ResponseError(400, "order cannot be canceled");
    }
    const updateOrder = await cancelOrder(order.id, order.orderItem);
    return updateOrder;
  }

  static async getAllOrders(userId: number) {
    const ecommerceAdmin = await prisma.user.findUnique({
      where: { id: userId, role: "ECOMMERCEADMIN" },
    });
    if (!ecommerceAdmin) {
      throw new ResponseError(400, "you cant access this resource");
    }

    const orders = await prisma.order.findMany({});
    if (orders.length === 0) {
      throw new ResponseError(400, "there are any order");
    }
    return orders;
  }
}
