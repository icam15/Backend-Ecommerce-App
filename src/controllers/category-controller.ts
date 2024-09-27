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

  async deleteCategory(req: Request, res: Response, next: NextFunction) {}
  async getCategoryById(req: Request, res: Response, next: NextFunction) {}
  async getCategories(req: Request, res: Response, next: NextFunction) {}
}