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
    this.router.post(
      "/apply-voucher",
      this.orderController.applyDiscountVoucher
    );
    this.router.get("/:orderId", this.orderController.getOrder);
    this.router.get("/status/:status", this.orderController.getOrderByStatus);
  }
  getRouter(): Router {
    return this.router;
  }
}
