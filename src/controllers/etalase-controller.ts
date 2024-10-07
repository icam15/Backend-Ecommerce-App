import { NextFunction, Request, Response } from "express";
import { ResponseError } from "../helpers/response-error";
import { EtalaseService } from "../services/etalase-services";
import { validate } from "../validation/validation";
import { EtalaseStoreValidation } from "../validation/etalase-validation";
import {
  CreateEtalaseStorePayload,
  UpdateEtalaseStorePayload,
} from "../types/etalase-types";
import { logger } from "../libs/logger";

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

  async updateEtalase(
    req: Request<{ etalaseId: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const session = req.user;
      const payload = validate(
        EtalaseStoreValidation.updateEtalaseValidation,
        req.body as UpdateEtalaseStorePayload
      );
      const icon = req.file!;
      logger.info(payload);
      const { etalaseId } = req.params;
      await EtalaseService.updateEtalaseStore(
        session.id,
        Number(etalaseId),
        icon,
        payload
      );
      res.status(201).json({
        status: "success",
        message: "update etalase store is successfully",
      });
    } catch (e) {
      next(e);
    }
  }

  async getEtalasesByStore(
    req: Request<{ storeId: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { storeId } = req.params;
      const result = await EtalaseService.getEtalaseByStoreId(Number(storeId));
      res.status(201).json({
        status: "success",
        message: "get all etalase by store is success",
        result,
      });
    } catch (e) {
      next(e);
    }
  }

  async deleteEtalaseStore(
    req: Request<{ etalaseId: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const session = req.user;
      const { etalaseId } = req.params;
      await EtalaseService.deleteEtalaseStore(session.id, parseInt(etalaseId));
      res.status(201).json({
        status: "success",
        message: "delete etalase store is success",
      });
    } catch (e) {
      next(e);
    }
  }
}
