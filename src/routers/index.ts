import express, { Router } from "express";
import { AuthRouter } from "./auth-router";
import { UserRouter } from "./user-router";
import { authenticationUser } from "../middleware/auth/authentication";
import { AddressRouter } from "./address-router";
import { CategoryRouter } from "./category-router";

export class RootRouter {
  private router: Router;
  private authRouter: AuthRouter;
  private userRouter: UserRouter;
  private addressRouter: AddressRouter;
  private categoryRouter: CategoryRouter;
  constructor() {
    this.router = Router();
    this.authRouter = new AuthRouter();
    this.userRouter = new UserRouter();
    this.addressRouter = new AddressRouter();
    this.categoryRouter = new CategoryRouter();
    this.initializeRouter();
  }
  private initializeRouter(): void {
    this.router.use("/auth", this.authRouter.getRouter());
    this.router.use("/user", authenticationUser, this.userRouter.getRouter());
    this.router.use(
      "/address",
      authenticationUser,
      this.addressRouter.getRouter()
    );
    this.router.use(
      "/category",
      authenticationUser,
      this.categoryRouter.getRouter()
    );
  }
  getRouter() {
    return this.router;
  }
}
