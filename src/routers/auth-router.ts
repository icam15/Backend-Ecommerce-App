import { AuthController } from "./../controllers/auth-controller";
import { Router } from "express";

export class AuthRouter {
  private router: Router;
  private authController: AuthController;
  constructor() {
    this.authController = new AuthController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post("/sign-up", this.authController.signUpUser);
    this.router.post("/verify-account", this.authController.verifyAccountUser);
  }

  getRouter(): Router {
    return this.router;
  }
}
