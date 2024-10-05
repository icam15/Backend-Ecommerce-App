import { NextFunction, Request, Response } from "express";
import { ResponseError } from "../helpers/response-error";
import { validate } from "../validation/validation";
import { ProductValidation } from "../validation/product-validation";
import { ProductService } from "../services/product-service";
import {
  CreateProductPayload,
  UpdateProductPayload,
} from "../types/product-types";

export class ProductController {
  async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const session = req.user;
      const payload = validate(ProductValidation.createProductValidation, {
        ...req.body,
      } as CreateProductPayload);
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

  async updateProductData(
    req: Request<{ productId: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { productId } = req.params;
      const session = req.user;
      const payload = validate(
        ProductValidation.updateProductValidation,
        req.body as UpdateProductPayload
      );
      await ProductService.updateProductData(
        session.id,
        Number(productId),
        payload
      );
      res.status(201).json({
        status: "success",
        message: "update product data is successfully",
      });
    } catch (e) {
      next(e);
    }
  }

  async updateProductImage(
    req: Request<{ productId: string; imageId: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { productId, imageId } = req.params;
      const session = req.user;
      const image = req.file;
      if (!image) {
        throw new ResponseError(400, "required image field");
      }
      await ProductService.updateProductImage(
        session.id,
        parseInt(productId),
        parseInt(imageId),
        image
      );
      res.status(201).json({
        status: "success",
        message: "update image product successfully",
      });
    } catch (e) {
      next(e);
    }
  }

  async getProductById(
    req: Request<{ productId: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { productId } = req.params;
      const result = await ProductService.getProductById(parseInt(productId));
      res.status(201).json({
        status: "success",
        message: "get product is successfully",
        result,
      });
    } catch (e) {
      next(e);
    }
  }

  async deleteProduct(
    req: Request<{ productId: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const session = req.user;
      const { productId } = req.params;
      await ProductService.deleteProduct(session.id, Number(productId));
      res.status(201).json({
        status: "success",
        message: "delete product is successfully",
      });
    } catch (e) {
      next(e);
    }
  }

  async setProductToInActive(
    req: Request<{ productId: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const session = req.user;
      const { productId } = req.params;
      await ProductService.setProductToInActive(session.id, Number(productId));
      res.status(201).json({
        status: "success",
        message: "set product to inActive is successfully",
      });
    } catch (e) {
      next(e);
    }
  }

  async setProductToActive(
    req: Request<{ productId: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const session = req.user;
      const { productId } = req.params;
      await ProductService.setProductToActive(session.id, Number(productId));
      res.status(201).json({
        status: "succeess",
        message: "set product status to active is successfully",
      });
    } catch (e) {
      next(e);
    }
  }
}
