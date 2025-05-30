import { z } from "zod";
import { NextFunction, Request, Response } from "express";
import { OrderService } from "../services/order-service";
import { validate } from "../validation/validation";
import { OrderValidation } from "../validation/order-validation";
import {
  ApplyDiscountVoucherPayload,
  CalculateOrderPayload,
  CancelOrderPayload,
  ChangeOrderStatusPayload,
  CreateWrapperOrderPayload,
} from "../types/order-types";
import { ResponseError } from "../helpers/response-error";

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
        req.body as CalculateOrderPayload
      );
      const result = await OrderService.calculateOrderItemsByStore(
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
      const session = req.user;
      const payload = validate(
        OrderValidation.applyDiscountVoucherValidation,
        req.body as ApplyDiscountVoucherPayload
      );
      const result = await OrderService.applyDiscountVoucher(
        session.id,
        payload
      );
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
        req.body as CreateWrapperOrderPayload
      );
      const { paymentLink } = await OrderService.createOrder(
        session.id,
        payload
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

  async getOrder(
    req: Request<{ orderId: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const session = req.user;
      const orderId = z.string().parse(req.params.orderId);
      const result = await OrderService.getOrder(session.id, Number(orderId));
      res.status(201).json({
        status: "success",
        message: "get order is success",
        result,
      });
    } catch (e) {
      next(e);
    }
    1;
  }

  async getOrderByStatus(
    req: Request<{ status: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const session = req.user;
      const status = z.string().parse(req.params.status);
      const result = await OrderService.getOrderByStatus(session.id, status);
      res.status(201).json({
        status: "success",
        message: "get orders by status is success",
        result,
      });
    } catch (e) {
      next(e);
    }
  }

  async cancelOrder(
    req: Request<{ orderId: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const session = req.user;
      const orderId = z.string().parse(req.params.orderId);
      await OrderService.cancelOrder(session.id, Number(orderId));
      res.status(201).json({
        status: "success",
        message: `order id:${orderId} success canceled`,
      });
    } catch (e) {
      next(e);
    }
  }

  async confirmOrder(
    req: Request<{ orderId: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const session = req.user;
      const orderId = z.string().parse(req.params.orderId);
      const result = await OrderService.confirmOrder(
        session.id,
        Number(orderId)
      );
      res.status(201).json({
        status: "success",
        message: "order is success confirmed",
        result,
      });
    } catch (e) {
      next(e);
    }
  }

  async uploadPaymentProof(
    req: Request<{ orderId: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const session = req.user;
      if (!req.file) throw new ResponseError(400, "no file uploaded");
      const orderId = z.string().parse(req.params.orderId);
      const result = await OrderService.uploadPaymentProof(
        session.id,
        Number(orderId),
        req.file!
      );
      res.status(201).json({
        status: "success",
        message: "upload payment proof is success",
        result,
      });
    } catch (e) {
      next(e);
    }
  }

  async updateOrderStateByStoreAdmin(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const session = req.user;
      const payload = validate(
        OrderValidation.changeOrderStatusValidation,
        req.body as ChangeOrderStatusPayload
      );
      const result = await OrderService.updateOrderStateByStoreAdmin(
        session.id,
        payload
      );
      res.status(200).json({
        status: "success",
        message: "change order status is success",
        result,
      });
    } catch (e) {
      next(e);
    }
  }

  async cancelOrderByAdminStore(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const session = req.user;
      const payload = validate(
        OrderValidation.cancelOrderValidation,
        req.body as CancelOrderPayload
      );
      const result = await OrderService.cancelOrderByAdminStore(
        session.id,
        payload
      );
      res.status(200).json({
        status: "success",
        message: "cancel order is success",
        result,
      });
    } catch (e) {
      next(e);
    }
  }

  async getAllOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const session = req.user;
      const result = await OrderService.getAllOrders(session.id);
      res.status(200).json({
        status: "success",
        message: "get all order is success",
        result,
      });
    } catch (e) {
      next(e);
    }
  }

  async updateOrderStateByEcommerceAdmin(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const session = req.user;
      const payload = validate(
        OrderValidation.changeOrderStatusValidation,
        req.body as ChangeOrderStatusPayload
      );
      const result = await OrderService.updateOrderStateByEcommerceAdmin(
        session.id,
        payload
      );
      res.status(201).json({
        status: "success",
        message: "change order status is success",
        result,
      });
    } catch (e) {
      next(e);
    }
  }
}
