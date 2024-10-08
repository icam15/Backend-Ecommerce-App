import { Router } from "express";
import { CartController } from "../controllers/cart-controller";

export class CartRouter {
  private router: Router;
  private cartController: CartController;
  constructor() {
    this.router = Router();
    this.cartController = new CartController();
  }
}
