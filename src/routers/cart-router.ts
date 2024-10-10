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
    this.router.get("/items", this.cartController.getCart);
    this.router.post("/add", this.cartController.addCartItem);
    this.router.patch("/update", this.cartController.udpateCartItem);
    this.router.patch("/select", this.cartController.selectCartItem);
    this.router.patch("/select-all", this.cartController.selectAllCartItems);
    this.router.patch(
      "/select-by-store",
      this.cartController.selectCartItemsByStore
    );
    this.router.delete("/items/:itemId", this.cartController.deleteCartItem);
  }

  getRouter(): Router {
    return this.router;
  }
}
