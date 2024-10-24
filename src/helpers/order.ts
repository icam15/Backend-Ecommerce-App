import { Response, response } from "express";
import { prisma } from "../libs/prisma";
import { ResponseError } from "./response-error";
import { Cart, CartItem, Product } from "@prisma/client";
import { ShippingService } from "../services/shipping-service";

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
  if (!cartItems) {
    throw new ResponseError(
      400,
      "user cart does not contain items selected by the store"
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
    origin: 501,
    destination: 114,
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

  return { discount };
};

export const applyDiscountVoucher = async (
  finalTotalPrice: number,
  finalShippingConst: number,
  items: [],
  userId: number
) => {};
