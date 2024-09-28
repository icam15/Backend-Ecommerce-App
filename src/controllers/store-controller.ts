import { NextFunction, Request, Response } from "express";
import { validate } from "../validation/validation";
import { StoreValidation } from "../validation/store-validation";
import { StoreService } from "../services/store-service";
import { CreateStorePayload } from "../types/store-types";

export class StoreController {
  async createStore(req: Request, res: Response, next: NextFunction) {
    try {
      const session = req.user;
      const payload = validate(
        StoreValidation.createStoreValidation,
        req.body as CreateStorePayload
      );
      const result = await StoreService.createStore(session.id, payload);
      res.status(201).json({
        status: "success",
        message: "new store is created",
        result,
      });
    } catch (e) {
      next(e);
    }
  }
}
