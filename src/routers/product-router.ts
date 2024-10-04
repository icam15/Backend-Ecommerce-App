import { Router } from "express";
import { ProductController } from "../controllers/product-controller";
import { Authorization } from "../middleware/auth/authorization";
import { uploadFile } from "../utils/multer";
import { convertFieldToInteger } from "./../middleware/convertField-middleware";

const stringToIntegerFields = [
  "price",
  "categoryId",
  "quantity",
  "discountPrice",
  "storeEtalaseId",
];
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
      uploadFile.array("images", 5),
      convertFieldToInteger(stringToIntegerFields),
      this.productController.createProduct
    );
    this.router.patch(
      "/:productId",
      Authorization.storeAdmin,
      this.productController.updateProductData
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
