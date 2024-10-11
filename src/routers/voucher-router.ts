import { Router } from "express";
import { voucherController } from "../controllers/voucher-controller";
import { Authorization } from "../middleware/auth/authorization";
import { uploadFile } from "../utils/multer";
import { convertFieldToInteger } from "../middleware/convertField-middleware";

const fieldConvert = ["discount", "minOrderItem", "minOrderPrice", "stock"];

export class VoucherRouter {
  private router: Router;
  private voucherController: voucherController;
  constructor() {
    this.router = Router();
    this.voucherController = new voucherController();
    this.initializeRouter();
  }

  private initializeRouter(): void {
    this.router.post(
      "/ecommerce",
      Authorization.ecommerceAdmin,
      uploadFile.single("image-voucher"),
      convertFieldToInteger(fieldConvert),
      this.voucherController.createEcommerceVoucher
    );
    this.router.post(
      "/store",
      Authorization.storeAdmin,
      uploadFile.single("image-voucher"),
      convertFieldToInteger(fieldConvert),
      this.voucherController.createStoreVoucher
    );
    this.router.get("/:voucherId", this.voucherController.getVoucher);
    this.router.patch(
      "/:voucherId/ecommerce",
      Authorization.ecommerceAdmin,
      this.voucherController.updateEcommerceVoucherDate
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
