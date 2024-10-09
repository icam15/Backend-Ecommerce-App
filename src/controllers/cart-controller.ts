import { NextFunction, Request, Response } from "express";
import { CartServcie } from "../services/cart-service";

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
}
