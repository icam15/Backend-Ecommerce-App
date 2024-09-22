import { Router } from "express";

export class UserRouter {
  private router: Router;
  constructor() {
    this.router = Router();
  }

  private initializeRouter(): void {}

  getRouter(): Router {
    return this.router;
  }
}
