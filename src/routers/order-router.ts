import { Router } from "express";
import { OrderController } from "../controllers/order-controller";

export class OrderRouter {
  private router: Router;
  private orderController: OrderController;
  constructor() {
    this.router = Router();
    this.orderController = new OrderController();
    this.initializeRouter();
  }

  private initializeRouter() {
    this.router.get("/checkout", this.orderController.getCheckoutCart);
  }
  getRouter(): Router {
    return this.router;
  }
}
