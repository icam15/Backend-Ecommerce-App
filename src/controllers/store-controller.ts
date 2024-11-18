import { NextFunction, Request, Response } from "express";
import { validate } from "../validation/validation";
import { StoreValidation } from "../validation/store-validation";
import { StoreService } from "../services/store-service";
import {
  AddStoreAdminPayload,
  CreateStorePayload,
  DeleteStoreAdminPayload,
  UpdateStorePayload,
} from "../types/store-types";
import { z } from "zod";

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

  async updateStoreImage(
    req: Request<{ storeId: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const image = req.file!;
      const session = req.user;
      const storeId = z.string().parse(req.params.storeId);
      await StoreService.UpdateStoreImage(session.id, parseInt(storeId), image);
      res.status(201).json({
        status: "success",
        message: "update store image is successfully",
      });
    } catch (e) {
      next(e);
    }
  }

  async getStore(
    req: Request<{ storeId: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const storeId = z.string().parse(req.params.storeId);
      const result = await StoreService.getStoreById(parseInt(storeId));
      res.status(201).json({
        status: "success",
        message: "get store is successfully",
        result,
      });
    } catch (e) {
      next(e);
    }
  }

  async updateStore(
    req: Request<{ storeId: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const payload = validate(
        StoreValidation.createStoreValidation,
        req.body as UpdateStorePayload
      );
      const session = req.user;
      const storeId = z.string().parse(req.params.storeId);
      await StoreService.updateStore(session.id, parseInt(storeId), payload);
      res.status(201).json({
        status: "success",
        message: "update store is successfully",
      });
    } catch (e) {
      next(e);
    }
  }
  async deleteStore(
    req: Request<{ storeId: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const storeId = z.string().parse(req.params.storeId);
      const session = req.user;
      await StoreService.deleteStore(session.id, parseInt(storeId));
      res.status(201).json({
        status: "success",
        message: "delete store is successfully",
      });
    } catch (e) {
      next(e);
    }
  }

  async addStoreAdmin(
    req: Request<{ storeId: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const storeId = z.string().parse(req.params.storeId);
      const session = req.user;
      const payload = validate(
        StoreValidation.addStoreAdminValidation,
        req.body as AddStoreAdminPayload
      );
      await StoreService.addStoreAdmin(session.id, parseInt(storeId), payload);
      res.status(201).json({
        status: "success",
        message: "add new store admin is successfully",
      });
    } catch (e) {
      next(e);
    }
  }

  async deleteStoreAdmin(
    req: Request<{ storeId: string; adminId: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const session = req.user;
      const paramsProperties = z
        .object({
          storeId: z.string(),
          adminId: z.string(),
        })
        .parse({ ...req.params });
      await StoreService.deleteStoreAdmin(
        session.id,
        parseInt(paramsProperties.storeId),
        parseInt(paramsProperties.storeId)
      );
      res.status(201).json({
        status: "success",
        message: "delete admin store is successfully",
      });
    } catch (e) {
      next(e);
    }
  }

  async getStoreAdmin(
    req: Request<{ storeId: string; adminId: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const paramsProperties = z
        .object({
          storeId: z.string(),
          adminId: z.string(),
        })
        .parse({ ...req.params });
      const session = req.user;
      const result = await StoreService.getStoreAdminByid(
        session.id,
        parseInt(paramsProperties.storeId),
        parseInt(paramsProperties.adminId)
      );
      res.status(201).json({
        status: "success",
        message: "get admin store is successfully",
        result,
      });
    } catch (e) {
      next(e);
    }
  }

  async getStoreAdmins(
    req: Request<{ storeId: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const session = req.user;
      const storeId = z.string().parse(req.params.storeId);
      const result = await StoreService.getStoreAdmins(
        session.id,
        parseInt(storeId)
      );
      res.status(201).json({
        status: "success",
        message: "get all admin store is successfully",
        result,
      });
    } catch (e) {
      next(e);
    }
  }

  async getStoreProducts(
    req: Request<{ storeId: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const storeId = z.string().parse(req.params.storeId);
      const result = await StoreService.getProductsBystore(Number(storeId));
      res.status(201).json({
        status: "success",
        message: "get product by store is success",
        result,
      });
    } catch (e) {
      next(e);
    }
  }

  async getStoreEtalases(
    req: Request<{ storeId: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const storeId = z.string().parse(req.params.storeId);
      const result = await StoreService.getEtalasesByStore(Number(storeId));
      res.status(201).json({
        status: "success",
        message: "get store etalase is success",
        result,
      });
    } catch (e) {
      next(e);
    }
  }

  async getStoreVouchers(
    req: Request<{ storeId: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const storeId = z.string().parse(req.params.storeId);
      const result = await StoreService.getStoreVouchers(Number(storeId));
      res.status(201).json({
        status: "success",
        message: "get store vouchers is success",
        result,
      });
    } catch (e) {
      next(e);
    }
  }
}
