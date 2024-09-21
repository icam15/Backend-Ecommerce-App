import { NextFunction, Request, Response } from "express";
import { ResponseError } from "../../helpers/response-error";

export const authenticationUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
  } catch (e) {
    // get accessToken form cookie
    const accessToken = req.cookies.ecm_app_AT;
    if (!accessToken) {
      throw new ResponseError(401, "unAuthorization");
    }
  }
};
