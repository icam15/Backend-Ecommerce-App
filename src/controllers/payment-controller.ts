import { NextFunction, Request, Response } from "express";
import { validate } from "../validation/validation";
import { PaymentValidation } from "../validation/payment-validation";
import { PaymentTransactionStatusPayload } from "../types/payment-types";
import { PaymentService } from "../services/payment-services";

export class PaymentController {
  async updateOrderStateByPaymentGateway(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const payload = validate(
        PaymentValidation.paymentTransactionStatusValidation,
        req.body as PaymentTransactionStatusPayload
      );
      await PaymentService.updateOrderStatus(payload);
      res.status(200).json({
        status: "success",
        message: "success update transaction status",
      });
    } catch (e) {
      next(e);
    }
  }
}
