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
import { z } from "zod";

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
      const etalaseId = z.string().parse(req.params.etalaseId);
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

  async deleteEtalaseStore(
    req: Request<{ etalaseId: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const session = req.user;
      const etalaseId = z.string().parse(req.params.etalaseId);
      await EtalaseService.deleteEtalaseStore(session.id, parseInt(etalaseId));
      res.status(201).json({
        status: "success",
        message: "delete etalase store is success",
      });
    } catch (e) {
      next(e);
    }
  }

  async getEtalase(
    req: Request<{ etalaseId: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const etalaseId = z.string().parse(req.params.etalaseId);
      const result = await EtalaseService.getEtalaseById(parseInt(etalaseId));
      res.status(201).json({
        status: "success",
        message: "get etalase is success",
        result,
      });
    } catch (e) {
      next(e);
    }
  }

  async getProductsByEtalase(
    req: Request<{ etalaseId: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const etalaseId = z.string().parse(req.params.etalaseId);
      const result = await EtalaseService.getProductsByEtalaseId(
        Number(etalaseId)
      );
      res.status(201).json({
        status: "success",
        message: "get product by etalase is success",
        result,
      });
    } catch (e) {
      next(e);
    }
  }
}
