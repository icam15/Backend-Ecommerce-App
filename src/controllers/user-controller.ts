import { NextFunction, Request, Response } from "express";
import { UserService } from "../services/user-service";

export class UserController {
  async getUser(req: Request, res: Response, next: NextFunction) {
    const session = req.user;
    const result = await UserService.getUserByid(session.id);
    res.status(201).json({
      status: "success",
      message: "success find user by id",
      result,
    });
  }
}
