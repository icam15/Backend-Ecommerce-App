import { NextFunction, Request, Response } from "express";
import { CategoryService } from "../services/category-service";
import { validate } from "../validation/validation";
import { CategoryValidation } from "../validation/category-validation";
import { CreateCategoryPayload } from "../types/category-types";

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

  async deleteCategory(req: Request, res: Response, next: NextFunction) {}
  async updateCategory(req: Request, res: Response, next: NextFunction) {}
  async getCategoryById(req: Request, res: Response, next: NextFunction) {}
  async getCategories(req: Request, res: Response, next: NextFunction) {}
}
