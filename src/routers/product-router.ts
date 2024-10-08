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
      uploadFile.array("images"),
      convertFieldToInteger(stringToIntegerFields),
      this.productController.createProduct
    );
    this.router.patch(
      "/:productId",
      Authorization.storeAdmin,
      this.productController.updateProductData
    );
    this.router.patch(
      "/:productId/images/:imageId",
      uploadFile.single("image"),
      Authorization.storeAdmin,
      this.productController.updateProductImage
    );
    this.router.get("/:productId", this.productController.getProductById);
    this.router.delete(
      "/:productId",
      Authorization.storeAdmin,
      this.productController.deleteProduct
    );
    this.router.patch(
      "/:productId/set-inActive",
      Authorization.storeAdmin,
      this.productController.setProductToInActive
    );
    this.router.patch(
      "/:productId/set-active",
      Authorization.storeAdmin,
      this.productController.setProductToActive
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
