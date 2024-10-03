import { Router } from "express";

export class ProductRouter {
  private router: Router;
  constructor() {
    this.router = Router();
  }

  private initializeRoute(): void {}

  getRouter(): Router {
    return this.router;
  }
}
