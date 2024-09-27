import { Router } from "express";
import { CategoryController } from "../controllers/category-controller";
import { Authorization } from "../middleware/auth/authorization";

export class CategoryRouter {
  private router: Router;
  private categoryController: CategoryController;
  constructor() {
    this.router = Router();
    this.categoryController = new CategoryController();
    this.initializeRouter();
  }

  private initializeRouter(): void {
    this.router.post(
      "/",
      Authorization.ecommerceAdmin,
      this.categoryController.createCategory
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
