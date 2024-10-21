import { True } from "./../../node_modules/.prisma/client/index.d";
import { response } from "express";
import { prisma } from "../libs/prisma";
import { ResponseError } from "./response-error";
import { CartItem } from "@prisma/client";
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
};

export const calculateTotalPriceAndWeight = async (
  userId: number,
  storeId: number
) => {
  let totalProductPrice = 0;
  let totalProductWeight = 0;
  // get exist cart
  const existCart = await prisma.cart.findUnique({
    where: {
      userId,
    },
  });
  if (!existCart) {
    throw new ResponseError(400, "cart not found");
  }

  // get cart items
  const cartItems = await prisma.cartItem.findMany({
    where: {
      cartId: existCart.id,
      isSelected: true,
    },
    include: {
      product: true,
    },
  });
  // check stock
  cartItems.map(async (item) => {
    const findStock = await prisma.stock.findUnique({
      where: { productId: item.productId },
    });
    if (!findStock) {
      throw new ResponseError(400, "stock not found");
    } else if (item.quantity > findStock.amount) {
      throw new ResponseError(400, "insufficient product stock");
    }
    totalProductPrice = totalProductPrice + item.quantity * item.product.price;
    totalProductWeight =
      totalProductWeight + item.quantity * item.product.weight;
  });

  return { totalProductPrice, totalProductWeight };
};

export const calculateShippingCost = async (
  origin: number,
  destination: number,
  weight: number,
  courier: string
) => {
  const cost = await ShippingService.getShippingCost({
    origin,
    destination,
    weight,
    courier,
  });
  return { cost };
};
