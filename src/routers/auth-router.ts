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
    this.router.post("/sign-in", this.authController.sigInUser);
    this.router.post("/forgot-password", this.authController.forgotPassword);
    this.router.post("/reset-password", this.authController.resetPassword);
  }

  getRouter(): Router {
    return this.router;
  }
}