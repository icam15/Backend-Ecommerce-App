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
      const { storeId } = req.params;
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
      const { storeId } = req.params;
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
      const { storeId } = req.params;
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
      const { storeId } = req.params;
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
      const { storeId } = req.params;
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
      const { storeId, adminId } = req.params;
      await StoreService.deleteStoreAdmin(
        session.id,
        parseInt(storeId),
        parseInt(adminId)
      );
      res.status(201).json({
        status: "success",
        message: "delete admin store is successfully",
      });
    } catch (e) {
      next(e);
    }
  }
}
