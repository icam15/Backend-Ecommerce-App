import { NextFunction, Request, Response } from "express";
import { OrderService } from "../services/order-service";
import { validate } from "../validation/validation";
import { OrderValidation } from "../validation/order-validation";
import { CalculateOrderPerStorePayload } from "../types/order-types";

export class OrderController {
  async getCheckoutCart(req: Request, res: Response, next: NextFunction) {
    try {
      const session = req.user;
      const result = await OrderService.getCheckoutCart(session.id);
      res.status(201).json({
        status: "success",
        message: "checkout cart is success",
        result,
      });
    } catch (e) {
      next(e);
    }
  }

  async calculateOrderItemsByStore(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const session = req.user;
      const payload = validate(
        OrderValidation.calculateOrderItemsByStoreValidation,
        req.body as CalculateOrderPerStorePayload
      );
      const result = await OrderService.calculateOrderItemByStore(
        session.id,
        payload
      );
      res.status(201).json({
        status: "success",
        message: "calculate cart items by store is success",
        result,
      });
    } catch (e) {
      next(e);
    }
  }
}
