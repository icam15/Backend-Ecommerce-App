import { NextFunction, Request, Response } from "express";
import { ResponseError } from "../../helpers/response-error";
import * as jwt from "jsonwebtoken";
import { AuthJwtPayload } from "../../types/auth-types";

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
    if (!accessToken) {
      throw new ResponseError(401, "unAuthorization");
    }
    jwt.verify(
      accessToken,
      process.env.JWT_ACCESS_SECRET!,
      { complete: true },
      function (
        err: jwt.VerifyErrors | undefined | any,
        decoded: jwt.JwtPayload | undefined
      ) {
        if (err instanceof jwt.TokenExpiredError) {
          throw new ResponseError(403, "token was expired");
        } else {
          req.user = decoded as AuthJwtPayload;
        }
      }
    );
    next();
  } catch (e) {
    next(e);
  }
};
