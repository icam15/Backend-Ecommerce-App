import { NextFunction, Request, Response } from "express";
import { CategoryService } from "../services/category-service";
import { validate } from "../validation/validation";
import { CategoryValidation } from "../validation/category-validation";
import {
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "../types/category-types";

export class CategoryController {
  async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const session = req.user;
      const payload = validate(
        CategoryValidation.createCategoryValidation,
        req.body as CreateCategoryPayload
      );
      const result = await CategoryService.createCategory(session.id, payload);
      res.status(201).json({
        status: "success",
        message: "create new category is successfully",
        result,
      });
    } catch (e) {
      next(e);
    }
  }

  async updateCategory(
    req: Request<{ categoryId: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { categoryId } = req.params;
      const session = req.user;
      const payload = validate(
        CategoryValidation.UpdateCategoryValidation,
        req.body as UpdateCategoryPayload
      );
      const result = await CategoryService.updateCategory(
        session.id,
        parseInt(categoryId),
        payload
      );
      res.status(201).json({
        status: "success",
        message: "update category is successfully",
        result,
      });
    } catch (e) {
      next(e);
    }
  }

  async deleteCategory(
    req: Request<{ categoryId: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const session = req.user;
      const { categoryId } = req.params;
      await CategoryService.deleteCategory(session.id, parseInt(categoryId));
      res.status(201).json({
        status: "success",
        message: "delete category is successfully",
      });
    } catch (e) {
      next(e);
    }
  }

  async getCategoryById(
    req: Request<{ categoryId: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { categoryId } = req.params;
      const result = await CategoryService.getCategoryById(
        parseInt(categoryId)
      );
      res.status(201).json({
        status: "success",
        message: "get spesific category is successfully",
        result,
      });
    } catch (e) {
      next(e);
    }
  }
  async getCategories(req: Request, res: Response, next: NextFunction) {}
}
