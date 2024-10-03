import { Router } from "express";
import { ProductController } from "../controllers/product-controller";
import { Authorization } from "../middleware/auth/authorization";
import { uploadFile } from "../utils/multer";
import { convertFieldToInteger } from "./../middleware/convertField-middleware";

const toIntegerFields = ["price", "categoryId"];

export class ProductRouter {
  private router: Router;
  private productController: ProductController;
  constructor() {
    this.router = Router();
    this.productController = new ProductController();
    this.initializeRoute();
  }

  private initializeRoute(): void {
    this.router.post(
      "/",
      Authorization.storeAdmin,
      uploadFile.array("images", 10),
      convertFieldToInteger(toIntegerFields),
      this.productController.createProduct
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
