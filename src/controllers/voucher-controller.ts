import { NextFunction, Request, Response } from "express";
import { validate } from "../validation/validation";
import { VoucherValidation } from "../validation/voucher-validation";
import { CreateVoucherPayload } from "../types/voucher-types";
import { ResponseError } from "../helpers/response-error";
import { VoucherService } from "../services/voucher-service";

export class voucherController {
  async createEcommerceVoucher(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const session = req.user;
      const imageVoucher = req.file;
      if (!imageVoucher) {
        throw new ResponseError(400, "required image voucher");
      }
      const payload = validate(
        VoucherValidation.createVoucherValidation,
        req.body as CreateVoucherPayload
      );
      const result = await VoucherService.createEcommerceVoucher(
        session.id,
        payload,
        imageVoucher
      );
      res.status(201).json({
        status: "success",
        message: "create ecommerce voucher is success",
        result,
      });
    } catch (e) {
      next(e);
    }
  }

  async createStoreVoucher(req: Request, res: Response, next: NextFunction) {
    try {
      const session = req.user;
      const imageVoucher = req.file;
      if (!imageVoucher) {
        throw new ResponseError(400, "required image voucher");
      }
      const payload = validate(
        VoucherValidation.createVoucherValidation,
        req.body as CreateVoucherPayload
      );
      const result = await VoucherService.createStoreVoucher(
        session.id,
        imageVoucher,
        payload
      );
      res.status(201).json({
        status: "success",
        message: "create store voucher is success",
        result,
      });
    } catch (e) {
      next(e);
    }
  }

  async getVoucher(
    req: Request<{ voucherId: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { voucherId } = req.params;
      const result = await VoucherService.getVoucher(Number(voucherId));
      res.status(201).json({
        status: "success",
        message: "get voucher is success",
        result,
      });
    } catch (e) {
      next(e);
    }
  }
}
