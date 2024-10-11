import { NextFunction, Request, Response } from "express";
import { ResponseError } from "../../helpers/response-error";

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
}
