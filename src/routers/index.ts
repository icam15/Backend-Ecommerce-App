import express, { Router } from "express";
import { AuthRouter } from "./auth-router";

export class RootRouter {
  private router: Router;
  private authRouter: AuthRouter;
  constructor() {
    this.router = Router();
    this.authRouter = new AuthRouter();
    this.initializeRouter();
  }
  private initializeRouter(): void {
    this.router.use("/auth", this.authRouter.getRouter());
  }
  getRouter() {
    return this.router;
  }
}
