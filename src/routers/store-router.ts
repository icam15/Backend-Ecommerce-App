import { Router } from "express";

export class StoreRouter {
  private router: Router;
  constructor() {
    this.router = Router();
    this.initializeRoute();
  }

  private initializeRoute() {}

  getRouter(): Router {
    return this.router;
  }
}
