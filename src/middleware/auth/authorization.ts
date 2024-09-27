import { NextFunction, Request, Response } from "express";

export class Authorization {
  public static storeAdmin(req: Request, res: Response, next: NextFunction) {
    try {
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
        res.status(403).send("Unauthorization access");
      }
      next();
    } catch (e) {
      next(e);
    }
  }
}
