import { NextFunction, Request, Response } from "express";
import { validate } from "../validation/validation";
import { VoucherValidation } from "../validation/voucher-validation";
import {
  AssignVoucherPayload,
  CreateVoucherPayload,
  UpdateVoucherPayload,
} from "../types/voucher-types";
import { ResponseError } from "../helpers/response-error";
import { VoucherService } from "../services/voucher-service";
import { z } from "zod";

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
      const voucherId = z.string().parse(req.params.voucherId);
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

  async updateEcommerceVoucherDate(
    req: Request<{ voucherId: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const session = req.user;
      const voucherId = z.string().parse(req.params.voucherId);
      const payload = validate(
        VoucherValidation.updateVoucherValidation,
        req.body as UpdateVoucherPayload
      );
      const result = await VoucherService.updateEcommerceVoucherData(
        session.id,
        Number(voucherId),
        payload
      );
      res.status(201).json({
        status: "success",
        message: "udpate general voucher is success",
        result,
      });
    } catch (e) {
      next(e);
    }
  }

  async updateStoreVoucherData(
    req: Request<{ voucherId: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const session = req.user;
      const voucherId = z.string().parse(req.params.voucherId);
      const payload = validate(
        VoucherValidation.updateVoucherValidation,
        req.body as UpdateVoucherPayload
      );
      const result = await VoucherService.updateStoreVoucherData(
        session.id,
        Number(voucherId),
        payload
      );
      res.status(201).json({
        status: "success",
        message: "update store voucher is success",
        result,
      });
    } catch (e) {
      next(e);
    }
  }

  async deleteEcommerceVoucher(
    req: Request<{ voucherId: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const session = req.user;
      const voucherId = z.string().parse(req.params.voucherId);
      await VoucherService.deleteEcommerceVoucher(
        session.id,
        Number(voucherId)
      );
      res.status(201).json({
        status: "success",
        message: "delete ecommerce voucher is success",
      });
    } catch (e) {
      next(e);
    }
  }

  async deleteStoreVoucher(
    req: Request<{ voucherId: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const session = req.user;
      const voucherId = z.string().parse(req.params.voucherId);
      await VoucherService.deleteStoreVoucher(session.id, Number(voucherId));
      res.status(201).json({
        status: "success",
        message: "delete store voucher is success",
      });
    } catch (e) {
      next(e);
    }
  }

  async claimVoucher(
    req: Request<{ voucherId: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const session = req.user;
      const voucherId = z.string().parse(req.params.voucherId);
      const result = await VoucherService.claimVoucher(
        session.id,
        Number(voucherId)
      );
      res.status(201).json({
        status: "success",
        message: "claim voucher is success",
      });
      result;
    } catch (e) {
      next(e);
    }
  }

  async assignVoucherToUser(req: Request, res: Response, next: NextFunction) {
    try {
      const session = req.user;
      const payload = validate(
        VoucherValidation.assignVoucherValidation,
        req.body as AssignVoucherPayload
      );
      const result = await VoucherService.assignVoucherToUser(
        session.id,
        payload
      );
      res.status(201).json({
        status: "success",
        message: "assign voucher to user is success",
        result,
      });
    } catch (e) {
      next(e);
    }
  }
}
