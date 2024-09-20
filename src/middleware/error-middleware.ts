import { NextFunction, Request, Response } from "express";
import { ResponseError } from "../helpers/response-error";
import { z } from "zod";

export const errorMiddleware = async (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ResponseError) {
    res.status(err.status).json({
      status: "error",
      message: err.message,
    });
  } else if (err instanceof z.ZodError) {
    res.status(400).json({
      status: "error",
      message: "Validatin error",
      errors: err.issues,
    });
  } else {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};
