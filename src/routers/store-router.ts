import { Router } from "express";
import { StoreController } from "../controllers/store-controller";
import { uploadFile } from "../utils/multer";
import { Authorization } from "../middleware/auth/authorization";

export class StoreRouter {
  private router: Router;
  private storeController: StoreController;
  constructor() {
    this.router = Router();
    this.storeController = new StoreController();
    this.initializeRoute();
  }

  private initializeRoute(): void {
    this.router.post("/", this.storeController.createStore);
    this.router.get("/:storeId", this.storeController.getStore);
    this.router.patch(
      "/:storeId/image",
      Authorization.storeAdmin,
      uploadFile.single("file"),
      this.storeController.updateStoreImage
    );
    this.router.patch(
      "/:storeId",
      Authorization.storeAdmin,
      this.storeController.updateStore
    );
    this.router.delete(
      "/:storeId",
      Authorization.storeAdmin,
      this.storeController.deleteStore
    );
    this.router.post(
      "/:storeId/admin",
      Authorization.storeAdmin,
      this.storeController.addStoreAdmin
    );
    this.router.delete(
      "/:storeId/admin/:adminId",
      Authorization.storeAdmin,
      this.storeController.deleteStoreAdmin
    );
    this.router.get(
      "/:storeId/admin/:adminId",
      Authorization.storeAdmin,
      this.storeController.getStoreAdmin
    );
    this.router.get(
      "/:storeId/admin",
      Authorization.storeAdmin,
      this.storeController.getStoreAdmins
    );
    this.router.get(
      "/:storeId/products",
      this.storeController.getStoreProducts
    );
    this.router.get(
      "/:storeId/etalases",
      this.storeController.getStoreEtalases
    );
    this.router.get(
      "/:storeId/vouchers",
      this.storeController.getStoreVouchers
    );
  }
  getRouter(): Router {
    return this.router;
  }
}
