import { NextFunction, Request, Response } from "express";
import { ResponseError } from "../../helpers/response-error";
import { AuthJwtPayload } from "../../types/auth-types";
import { logger } from "../../libs/logger";

export class Authorization {
  public static storeAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (user.role !== "STOREADMIN") {
        throw new ResponseError(
          403,
          "Required store admin role access. Access denied"
        );
      }
      next();
    } catch (e) {
      next(e);
    }
  }
  public static ecommerceAdmin(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const user = req.user;
      if (user.role !== "ECOMMERCEADMIN") {
        throw new ResponseError(
          403,
          "Required ecommerce admin role access. Access denied"
        );
      }
      next();
    } catch (e) {
      next(e);
    }
  }

  public static allAdmins(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      const validAdmin = ["STOREADMIN", "ECOMMERCEADMIN"];
      console.log(user);
      if (!validAdmin.includes(user.role)) {
        throw new ResponseError(
          400,
          "Access Denied, required either ecommerce admin or store admin role."
        );
      }
      next();
    } catch (e) {
      next(e);
    }
  }
}
