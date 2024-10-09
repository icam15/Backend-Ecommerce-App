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
  }

  getRouter(): Router {
    return this.router;
  }
}
