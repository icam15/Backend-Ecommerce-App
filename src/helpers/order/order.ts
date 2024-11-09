import { Response, response } from "express";
import { prisma } from "../../libs/prisma";
import { ResponseError } from "../response-error";
import {
  Cart,
  CartItem,
  OrderItem,
  OrderStatus,
  Product,
} from "@prisma/client";
import { ShippingService } from "../../services/shipping-service";
import dayjs from "dayjs";
import { OrderItemTypes } from "../../types/order-types";

export const getUserAddress = async (userId: number) => {
  const findAdress = await prisma.address.findFirst({
    where: {
      userId,
      isMainAddress: true,
    },
  });
  if (!findAdress) {
    throw new ResponseError(400, "user does not have/set main address");
  }
  return findAdress;
};

export const getExistStore = async (storeId: number) => {
  const existStore = await prisma.store.findUnique({
    where: {
      id: storeId,
    },
  });
  if (!existStore) {
    throw new ResponseError(400, "store not found");
  }
  return existStore;
};

export const getCartItemsSelectedByStore = async (
  userId: number,
  storeId: number
) => {
  // check exist cart
  const existCart = await prisma.cart.findUnique({
    where: {
      userId,
    },
  });
  if (!existCart) {
    throw new ResponseError(400, "cart not found");
  }
  const cartItems = await prisma.cartItem.findMany({
    where: {
      cartId: existCart.id,
      isSelected: true,
      storeId,
    },
    include: { product: true },
  });
  if (cartItems.length === 0) {
    throw new ResponseError(
      400,
      "user cart does not contain product selected by the store"
    );
  }
  return cartItems;
};

export const calculateTotalPriceAndWeight = async (cartItems: any) => {
  let totalProductPrice = 0;
  let totalProductWeight = 0;
  // check stock
  for (const item of cartItems) {
    const findStock = await prisma.stock.findUnique({
      where: { productId: item.productId },
    });
    if (!findStock) {
      throw new ResponseError(400, "stock not found");
    }
    if (item.quantity > findStock!.amount) {
      throw new ResponseError(400, "insufficient product stock");
    }
    totalProductPrice = totalProductPrice + item.quantity * item.product.price;
    totalProductWeight =
      totalProductWeight + item.quantity * item.product.weight;
  }

  return { totalProductPrice, totalProductWeight, cartItems };
};

export const calculateShippingCost = async (
  origin: number,
  destination: number,
  weight: number,
  courier: string,
  service: string
) => {
  const costs = await ShippingService.getShippingCost({
    origin,
    destination,
    weight,
    courier,
  });
  console.log(origin, destination, weight, courier);

  let serviceDescription;
  let cost;
  let estimation;

  if (service !== undefined) {
    const getCostByService: any = costs.find(
      (cost: any) => cost.service === service
    );
    serviceDescription = getCostByService.cost[0].service;
    cost = getCostByService.cost[0].value;
    estimation = getCostByService.cost[0].etd;
    return { cost, estimation, service: serviceDescription };
  }
  // console.log(costs);

  return { costs };
};

export const applyDiscountVoucherStore = async (
  totalProductsPrice: number,
  userId: number,
  voucherId: number,
  itemLength: number,
  storeId?: number
) => {
  let discount;
  // check exist voucher
  const findVoucher = await prisma.voucher.findUnique({
    where: { id: voucherId },
  });
  if (!findVoucher) {
    throw new ResponseError(400, "voucher not found");
  }

  // preRequisite for use the voucher
  if (findVoucher.storeId !== storeId) {
    throw new ResponseError(400, "store does not own the voucher");
  } else if (findVoucher.minOrderItem > itemLength) {
    throw new ResponseError(400, "incompleted requisite for use voucher");
  } else if (findVoucher.minOrderPrice > totalProductsPrice) {
    throw new ResponseError(400, "incompleted requisite for use voucher");
  } else if (dayjs(findVoucher.expireAt).isBefore(dayjs())) {
    throw new ResponseError(400, "expired voucher");
  } else if (findVoucher.isClaimable === false) {
    throw new ResponseError(400, "voucher is not claimable");
  } else if (findVoucher.ecommerceAdminId !== null) {
    throw new ResponseError(400, "voucher is not store voucher");
  }

  // check is user have that voucher
  const isUserOwnTheVoucher = await prisma.userVoucher.findFirst({
    where: {
      voucherId: findVoucher.id,
      userId,
    },
  });
  if (!isUserOwnTheVoucher) {
    throw new ResponseError(400, "user does not have the voucher");
  }

  // calculate voucher discount by the type
  if (findVoucher.discountType === "FIXED_DISCOUNT") {
    discount = findVoucher.discount;
  } else if (findVoucher.discountType === "PERCENT_DISCOUNT") {
    discount = (totalProductsPrice / 100) * findVoucher.discount;
  }

  return { discount, userVoucher: isUserOwnTheVoucher };
};

export const mapStatusOrderToEnum = (status: string): OrderStatus | null => {
  const statusMap: { [key: string]: OrderStatus } = {
    awaiting_for_payment: OrderStatus.WAITING_FOR_PAYMENT,
    awaiting_for_confirmation: OrderStatus.WAITING_FOR_CONFIRMATION,
    cancelled: OrderStatus.CANCELLED,
    process: OrderStatus.PROCESS,
    shipping: OrderStatus.SHIPPING,
    delivered: OrderStatus.DELIVERED,
    confirmed: OrderStatus.CONFIRMED,
  };
  console.log(statusMap[status.toLowerCase()]);
  return statusMap[status.toLowerCase()] || null;
};

export const cancelOrder = async (orderId: number, orderItems: OrderItem[]) => {
  const transaction = [
    prisma.order.update({
      where: { id: orderId },
      data: { orderStatus: "CANCELLED" },
    }),
    ...orderItems.flatMap((item) => {
      return [
        prisma.stock.update({
          where: {
            productId: item.productId,
          },
          data: {
            amount: item.quantity,
          },
        }),
      ];
    }),
  ];
  const updateOrder = await prisma.$transaction(transaction);
  return updateOrder;
};
