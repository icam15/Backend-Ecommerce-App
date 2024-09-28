import { Router } from "express";
import { StoreController } from "../controllers/store-controller";
import { uploadFile } from "../utils/multer";

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
    this.router.patch(
      "/:storeId/image",
      uploadFile.single("file"),
      this.storeController.updateStoreImage
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
