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
  private initializeRouter(): void {}
  getRouter(): Router {
    return this.router;
  }
}
