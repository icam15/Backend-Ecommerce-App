import { NextFunction, Request, Response } from "express";
import { CartServcie } from "../services/cart-service";
import { validate } from "../validation/validation";
import { CartValidation } from "../validation/cart-validation";
import {
  AddCartItemPayload,
  SelectCartItemPayload,
  SelectCartItemsByStorePayload,
  UpdateCartItemPayload,
} from "../types/cart-types";
import { ResponseError } from "../helpers/response-error";
import { z } from "zod";

export class CartController {
  async getCart(req: Request, res: Response, next: NextFunction) {
    try {
      const session = req.user;
      const result = await CartServcie.getCartItems(session.id);
      res.status(201).json({
        status: "success",
        message: "get cart is success",
        result,
      });
    } catch (e) {
      next(e);
    }
  }

  async addCartItem(req: Request, res: Response, next: NextFunction) {
    try {
      const session = req.user;
      const payload = validate(
        CartValidation.addCartItemValidation,
        req.body as AddCartItemPayload
      );
      const result = await CartServcie.addCartItem(session.id, payload);
      res.status(201).json({
        status: "success",
        message: "add cart item is success",
        result,
      });
    } catch (e) {
      next(e);
    }
  }

  async udpateCartItem(req: Request, res: Response, next: NextFunction) {
    try {
      const session = req.user;
      const payload = validate(
        CartValidation.udpateCartItemValidation,
        req.body as UpdateCartItemPayload
      );
      const result = await CartServcie.updateCartItem(session.id, payload);
      res.status(201).json({
        status: "success",
        message: "update cart item success",
        result,
      });
    } catch (e) {
      next(e);
    }
  }

  async selectCartItem(req: Request, res: Response, next: NextFunction) {
    try {
      const session = req.user;
      const payload = validate(
        CartValidation.selectCartItemValidation,
        req.body as SelectCartItemPayload
      );
      const result = await CartServcie.selectCartItem(session.id, payload);
      res.status(201).json({
        status: "success",
        message: "selected cart item success",
        result,
      });
    } catch (e) {
      next(e);
    }
  }

  async selectAllCartItems(
    req: Request<{}, {}, { isSelected: boolean }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const session = req.user;
      const { isSelected } = req.body;
      if (typeof isSelected !== "boolean" || isSelected === undefined) {
        throw new ResponseError(403, "isSelected field required boolean type");
      }
      const result = await CartServcie.selectAllCartItems(
        session.id,
        isSelected
      );
      res.status(201).json({
        status: "success",
        message: "select all cart items is success",
        result,
      });
    } catch (e) {
      next(e);
    }
  }

  async selectCartItemsByStore(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const session = req.user;
      const payload = validate(
        CartValidation.selectCartItemsByStoreValidation,
        req.body as SelectCartItemsByStorePayload
      );
      const result = await CartServcie.selectCartItemsByStore(
        session.id,
        payload
      );
      res.status(201).json({
        status: "success",
        message: "selected cart item by store is success",
        result,
      });
    } catch (e) {
      next(e);
    }
  }

  async deleteCartItem(
    req: Request<{ itemId: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const session = req.user;
      const { itemId } = req.params;
      if (itemId === undefined) {
        throw new ResponseError(400, "itemId field is required");
      }
      const result = await CartServcie.deleteCartItem(
        session.id,
        Number(itemId)
      );
      res.status(201).json({
        status: "success",
        message: "delete cart item is success",
        result,
      });
    } catch (e) {
      next(e);
    }
  }
}
