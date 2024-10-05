import { NextFunction, Request, Response } from "express";

export const convertFieldToInteger = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        req.body[field] = parseFloat(req.body[field]);
      }
    });
    next();
  };
};
