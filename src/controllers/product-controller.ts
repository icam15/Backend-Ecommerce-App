import { NextFunction, Request, Response } from "express";
import { ResponseError } from "../helpers/response-error";
import { validate } from "../validation/validation";
import { ProductValidation } from "../validation/product-validation";
import { ProductService } from "../services/product-service";
import { CreateProductPayload } from "../types/product-types";

export class ProductController {
  async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const session = req.user;
      const payload = validate(
        ProductValidation.createProductValidation,
        req.body as CreateProductPayload
      );
      const images = req.files as Express.Multer.File[];
      if (!images) {
        throw new ResponseError(400, "required product image");
      }
      const result = await ProductService.createProduct(
        session.id,
        images,
        payload
      );
      res.status(201).json({
        status: "success",
        message: "create new product is succeesfully",
        result,
      });
    } catch (e) {
      next(e);
    }
  }
}
