import { NextFunction, Request, Response } from "express";
import { ShippingService } from "../services/shipping-service";
import { ResponseError } from "../helpers/response-error";

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
}
