import { Router } from "express";
import { OrderController } from "../controllers/order-controller";
import { uploadFile } from "../utils/multer";
import { Authorization } from "../middleware/auth/authorization";

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
    this.router.post("/:orderId/cancel", this.orderController.cancelOrder);
    this.router.post("/:orderId/confirm", this.orderController.confirmOrder);
    this.router.patch(
      "/:orderId/payment-proof",
      uploadFile.single("file"),
      this.orderController.uploadPaymentProof
    );

    // admin store space
    this.router.patch(
      "/change-status-by-admin",
      Authorization.storeAdmin,
      this.orderController.changeStatusOrderByAdminStore
    );
    this.router.patch(
      "/cancel-by-admin",
      Authorization.storeAdmin,
      this.orderController.cancelOrderByAdminStore
    );
  }
  getRouter(): Router {
    return this.router;
  }
}
