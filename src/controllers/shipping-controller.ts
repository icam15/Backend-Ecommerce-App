import { NextFunction, Request, Response } from "express";
import { ShippingService } from "../services/shipping-service";
import { ResponseError } from "../helpers/response-error";
import { validate } from "../validation/validation";
import { ShippingValidation } from "../validation/shipping-validation";
import { GetShippingCostPayload } from "../types/shipping-types";

export class ShippingController {
  async getCities(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ShippingService.getCities();
      res.status(201).json({
        status: "success",
        message: "get cities is success",
        result,
      });
    } catch (e) {
      next(e);
    }
  }

  async getProvince(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ShippingService.getProvince();
      res.status(201).json({
        status: "success",
        message: "get province is success",
        result,
      });
    } catch (e) {
      next(e);
    }
  }
  async getShippingCost(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = validate(
        ShippingValidation.getShippingValidation,
        req.body as GetShippingCostPayload
      );
      const cost = await ShippingService.getShippingCost(payload);
      res.status(201).json({
        status: "success",
        message: "get shipping cost is succes",
        cost,
      });
    } catch (e) {
      next(e);
    }
  }
}
