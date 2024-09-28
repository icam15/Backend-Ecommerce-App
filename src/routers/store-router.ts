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
    this.router.post(
      "/",
      uploadFile.single("file"),
      this.storeController.createStore
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
