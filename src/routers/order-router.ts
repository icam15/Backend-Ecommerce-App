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
    this.router.post(
      "/calculate-order-by-store",
      this.orderController.calculateOrderItemsByStore
    );
    this.router.post("/add", this.orderController.createOrder);
  }
  getRouter(): Router {
    return this.router;
  }
}
