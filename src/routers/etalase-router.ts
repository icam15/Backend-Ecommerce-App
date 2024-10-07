import { Router } from "express";
import { Authorization } from "../middleware/auth/authorization";
import { uploadFile } from "../utils/multer";
import { EtalaseController } from "../controllers/etalase-controller";
import { convertFieldToInteger } from "../middleware/convertField-middleware";

const fieldToInteger = ["storeId"];

export class EtalaseRouter {
  private router: Router;
  private etalaseController: EtalaseController;
  constructor() {
    this.router = Router();
    this.etalaseController = new EtalaseController();
    this.initializeRoute();
  }

  private initializeRoute(): void {
    this.router.post(
      "/",
      Authorization.storeAdmin,
      uploadFile.single("icon"),
      convertFieldToInteger(fieldToInteger),
      this.etalaseController.createEtalase
    );
    this.router.patch(
      "/:etalaseId",
      Authorization.storeAdmin,
      uploadFile.single("icon"),
      convertFieldToInteger(fieldToInteger),
      this.etalaseController.updateEtalase
    );
    this.router.get("/:storeId", this.etalaseController.getEtalasesByStore);
    this.router.delete(
      "/:etalaseId",
      this.etalaseController.deleteEtalaseStore
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
