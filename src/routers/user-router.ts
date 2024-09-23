import { Router } from "express";
import { UserController } from "../controllers/user-controller";
import { uploadFile } from "../utils/multer";

export class UserRouter {
  private router: Router;
  private userController: UserController;
  constructor() {
    this.router = Router();
    this.userController = new UserController();
    this.initializeRouter();
  }

  private initializeRouter(): void {
    this.router.get("/", this.userController.getUser);
    this.router.patch("/", this.userController.updateUser);
    this.router.patch("/change-password");
    this.router.post(
      "/image",
      uploadFile.single("file"),
      this.userController.uploadImageUser
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
