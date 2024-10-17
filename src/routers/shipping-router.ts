import { Router } from "express";
import { ShippingController } from "../controllers/shipping-controller";

export class ShippingRouter {
  private router: Router;
  private shippingController: ShippingController;
  constructor() {
    this.router = Router();
    this.shippingController = new ShippingController();
    this.initializeRouter();
  }

  private initializeRouter(): void {
    this.router.get("/cities", this.shippingController.getCities);
    this.router.get("/province", this.shippingController.getProvince);
    this.router.post("/cost", this.shippingController.getShippingCost);
  }

  getRoute(): Router {
    return this.router;
  }
}
