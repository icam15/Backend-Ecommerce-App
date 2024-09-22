
import { NextFunction, Request, Response } from "express";
import { UserService } from "../services/user-service";
import { validate } from "../validation/validation";
import { UserValidation } from "../validation/user-validation";
import { UpdateUserPayload } from "../types/user-types";

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
}
