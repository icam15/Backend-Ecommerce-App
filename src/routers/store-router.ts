import { Router } from "express";
import { StoreController } from "../controllers/store-controller";

export class StoreRouter {
  private router: Router;
  private storeController: StoreController;
  constructor() {
    this.router = Router();
    this.storeController = new StoreController();
    this.initializeRoute();
  }

  private initializeRoute() {}

  getRouter(): Router {
    return this.router;
  }
}
