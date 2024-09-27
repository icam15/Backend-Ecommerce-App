import { Router } from "express";
import { CategoryController } from "../controllers/category-controller";

export class CategoryRouter {
  private router: Router;
  private categoryController: CategoryController;
  constructor() {
    this.router = Router();
    this.categoryController = new CategoryController();
    this.initializeRouter();
  }

  private initializeRouter(): void {
    this.router.post("/", this.categoryController.createCategory);
  }

  getRouter(): Router {
    return this.router;
  }
}
