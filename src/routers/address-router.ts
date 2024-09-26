import { Router } from "express";
import { AddressController } from "../controllers/address-controller";

export class AddressRouter {
  private router: Router;
  private addressController: AddressController;
  constructor() {
    this.router = Router();
    this.addressController = new AddressController();
    this.initializeRouter();
  }
  private initializeRouter(): void {
    this.router.post("/", this.addressController.createAddress);
    this.router.patch("/:addressId", this.addressController.updateAddress);
    this.router.patch(
      "/main/:addressId",
      this.addressController.setMainAddress
    );
  }
  getRouter(): Router {
    return this.router;
  }
}
