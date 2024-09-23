import { ChangePasswordPayload } from "./../types/user-types";
import { NextFunction, Request, Response } from "express";
import { UserService } from "../services/user-service";
import { validate } from "../validation/validation";
import { UserValidation } from "../validation/user-validation";
import { UpdateUserPayload } from "../types/user-types";
import { decode } from "base64-arraybuffer";
import { logger } from "../libs/logger";
import { uploadFileToBucket } from "../utils/supabase";
import { supabase } from "../libs/supabase";

export class UserController {
  async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const session = req.user;
      const result = await UserService.getUserByid(session.id);
      res.status(201).json({
        status: "success",
        message: "success find user by id",
        result,
      });
    } catch (e) {
      next(e);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const session = req.user;
      const payload = validate(
        UserValidation.updateUserValidation,
        req.body as UpdateUserPayload
      );
      const result = await UserService.UpdateUserById(session.id, payload);
      res.status(201).json({
        status: "success",
        message: "update",
        result,
      });
    } catch (e) {
      next(e);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const session = req.user;
      const payload = validate(
        UserValidation.changePasswordPayload,
        req.body as ChangePasswordPayload
      );
      const result = await UserService.changePassword(session.id, payload);
      res.status(201).json({
        status: "success",
        message: "change password was success",
        result,
      });
    } catch (e) {
      next(e);
    }
  }

  async uploadImageUser(req: Request, res: Response, next: NextFunction) {
    try {
      const file = req.file;
      const fileType = decode(file?.buffer.toString("base64")!);
      const { data, error } = await supabase.storage
        .from("avatar")
        .upload(file?.filename!, fileType);
      res.status(201).json(data);
    } catch (e) {
      next(e);
    }
  }
}
