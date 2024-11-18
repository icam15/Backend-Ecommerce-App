import { Router } from "express";
import { PaymentController } from "../controllers/payment-controller";

export class PaymentRouter {
  private router: Router;
  private paymentController: PaymentController;
  constructor() {
    this.router = Router();
    this.paymentController = new PaymentController();
    this.initializeRouters();
  }

  private initializeRouters(): void {
    this.router.post(
      "/midtrans",
      this.paymentController.updateOrderStateByPaymentGateway
    );
  }
  getRouter(): Router {
    return this.router;
  }
}
