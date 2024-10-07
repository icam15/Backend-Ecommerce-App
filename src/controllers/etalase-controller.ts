import { NextFunction, Request, Response } from "express";
import { ResponseError } from "../helpers/response-error";
import { EtalaseService } from "../services/etalase-services";
import { validate } from "../validation/validation";
import { EtalaseStoreValidation } from "../validation/etalase-validation";
import { CreateEtalaseStorePayload } from "../types/etalase-types";

export class EtalaseController {
  async createEtalase(req: Request, res: Response, next: NextFunction) {
    try {
      const session = req.user;
      const icon = req.file;
      if (!icon) {
        throw new ResponseError(400, "icon etalase is required");
      }
      const payload = validate(
        EtalaseStoreValidation.createEtalaseValidation,
        req.body as CreateEtalaseStorePayload
      );
      const result = await EtalaseService.createEtalaseStore(
        session.id,
        icon,
        payload
      );
      res.status(201).json({
        status: "success",
        message: "create new etalase store is success",
        result,
      });
    } catch (e) {
      next(e);
    }
  }
}
