import { Router } from "express";
import { ProductController } from "../controllers/product-controller";

export class ProductRouter {
  private router: Router;
  private productController: ProductController;
  constructor() {
    this.router = Router();
    this.productController = new ProductController();
  }

  private initializeRoute(): void {}

  getRouter(): Router {
    return this.router;
  }
}
