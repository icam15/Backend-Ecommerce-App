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
    this.router.patch(
      "/:categoryId",
      Authorization.ecommerceAdmin,
      this.categoryController.updateCategory
    );
    this.router.delete(
      "/:categoryId",
      Authorization.ecommerceAdmin,
      this.categoryController.deleteCategory
    );
    this.router.get("/:categoryId", this.categoryController.getCategoryById);
    this.router.get("/", this.categoryController.getCategories);
  }

  getRouter(): Router {
    return this.router;
  }
}
