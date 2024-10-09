import { Router } from "express";
import { CartController } from "../controllers/cart-controller";

export class CartRouter {
  private router: Router;
  private cartController: CartController;
  constructor() {
    this.router = Router();
    this.cartController = new CartController();
    this.InitializeRoute();
  }

  private InitializeRoute() {
    this.router.get("/", this.cartController.getCart);
    this.router.post("/add", this.cartController.addCartItem);
    this.router.patch("/update", this.cartController.udpateCartItem);
    this.router.patch("/select", this.cartController.selectCartItem);
    this.router.patch("/select-all", this.cartController.selectAllCartitems);
  }

  getRouter(): Router {
    return this.router;
  }
}
