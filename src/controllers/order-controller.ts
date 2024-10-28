import { NextFunction, Request, Response } from "express";
import { OrderService } from "../services/order-service";
import { validate } from "../validation/validation";
import { OrderValidation } from "../validation/order-validation";
import {
  ApplyDiscountVoucherPayload,
  CalculateOrderPerStorePayload,
  CreateOrderPayload,
} from "../types/order-types";

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

  async applyDiscountVoucher(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = validate(
        OrderValidation.applyDiscountVoucherValidation,
        req.body as ApplyDiscountVoucherPayload
      );
      const result = await OrderService.applyDiscountVoucher(payload);
      res.status(201).json({
        status: "success",
        message: "get discount voucher is success",
        result,
      });
    } catch (e) {
      next(e);
    }
  }

  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const session = req.user;
      const payload = validate(
        OrderValidation.createOrderValidation,
        req.body as CreateOrderPayload
      );
      const { paymentLink } = await OrderService.createOrder(
        session.id,
        payload,
        next
      );
      res.status(201).json({
        status: "success",
        message: "create new order order is success",
        paymentLink,
      });
    } catch (e) {
      next(e);
    }
  }
}
