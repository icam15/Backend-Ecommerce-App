import express, { Router } from "express";
import { AuthRouter } from "./auth-router";
import { UserRouter } from "./user-router";
import { authenticationUser } from "../middleware/auth/authentication";
import { AddressRouter } from "./address-router";
import { CategoryRouter } from "./category-router";
import { StoreRouter } from "./store-router";
import { ProductRouter } from "./product-router";
import { EtalaseRouter } from "./etalase-router";
import { CartRouter } from "./cart-router";
import { VoucherRouter } from "./voucher-router";

export class RootRouter {
  private router: Router;
  private authRouter: AuthRouter;
  private userRouter: UserRouter;
  private addressRouter: AddressRouter;
  private categoryRouter: CategoryRouter;
  private storeRouter: StoreRouter;
  private productRouter: ProductRouter;
  private etalaseRouter: EtalaseRouter;
  private cartRouter: CartRouter;
  private voucherRouter: VoucherRouter;
  constructor() {
    this.router = Router();
    this.authRouter = new AuthRouter();
    this.userRouter = new UserRouter();
    this.addressRouter = new AddressRouter();
    this.categoryRouter = new CategoryRouter();
    this.storeRouter = new StoreRouter();
    this.productRouter = new ProductRouter();
    this.etalaseRouter = new EtalaseRouter();
    this.cartRouter = new CartRouter();
    this.voucherRouter = new VoucherRouter();

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
    this.router.use("/store", authenticationUser, this.storeRouter.getRouter());
    this.router.use(
      "/product",
      authenticationUser,
      this.productRouter.getRouter()
    );
    this.router.use(
      "/etalase",
      authenticationUser,
      this.etalaseRouter.getRouter()
    );
    this.router.use("/cart", authenticationUser, this.cartRouter.getRouter());
    this.router.use(
      "/voucher",
      authenticationUser,
      this.voucherRouter.getRouter()
    );
  }
  getRouter() {
    return this.router;
  }
}
