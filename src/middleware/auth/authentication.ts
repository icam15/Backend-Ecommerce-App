import { NextFunction, Request, Response } from "express";
import { ResponseError } from "../../helpers/response-error";
import * as jwt from "jsonwebtoken";
import { AuthJwtPayload } from "../../types/auth-types";
import { logger } from "../../libs/logger";

declare global {
  namespace Express {
    interface Request {
      user: AuthJwtPayload;
    }
  }
}

export const authenticationUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // get accessToken from cookie
    const accessToken = req.cookies.ecm_app_AT;
    if (accessToken === undefined || null) {
      res.status(403).send("Unauthorization access");
    }
    jwt.verify(
      accessToken,
      process.env.JWT_ACCESS_SECRET!,
      { complete: true },
      function (
        err: jwt.VerifyErrors | undefined | any,
        decoded: AuthJwtPayload | undefined | any
      ) {
        if (err instanceof jwt.TokenExpiredError) {
          res.status(403).send("Token was expired");
        }
        res.locals.session = decoded.payload as AuthJwtPayload;
        req.user = decoded.payload as AuthJwtPayload;
      }
    );
    next();
  } catch (e) {
    next(e);
  }
};
