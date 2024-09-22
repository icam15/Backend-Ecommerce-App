import { Router } from "express";
import { UserController } from "../controllers/user-controller";

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
  }

  getRouter(): Router {
    return this.router;
  }
}
