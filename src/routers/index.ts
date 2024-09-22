import express, { Router } from "express";
import { AuthRouter } from "./auth-router";
import { UserRouter } from "./user-router";
import { authenticationUser } from "../middleware/auth/authentication";

export class RootRouter {
  private router: Router;
  private authRouter: AuthRouter;
  private userRouter: UserRouter;
  constructor() {
    this.router = Router();
    this.authRouter = new AuthRouter();
    this.userRouter = new UserRouter();
    this.initializeRouter();
  }
  private initializeRouter(): void {
    this.router.use("/auth", this.authRouter.getRouter());
    this.router.use("/user", authenticationUser, this.userRouter.getRouter());
  }
  getRouter() {
    return this.router;
  }
}
