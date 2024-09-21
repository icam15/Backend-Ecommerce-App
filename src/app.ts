import express, {
  Express,
  NextFunction,
  Request,
  Response,
  Router,
} from "express";
import cookieParser from "cookie-parser";
import { config } from "dotenv";
import { errorMiddleware } from "./middleware/error-middleware";
import { RootRouter } from "./routers";

config();
export class App {
  private app: Express;
  private PORT = process.env.PORT;
  constructor() {
    this.app = express();
    this.configuration();
    this.routes();
    this.handleError();
  }
  private configuration() {
    this.app.use(cookieParser());
    this.app.use(express.json());
    // this.app.get("/test", (req: Request, res: Response, next: NextFunction) => {
    //   res.send("Test successfully");
    // });
  }
  private routes() {
    const mainRouter = new RootRouter();
    this.app.use("/api", mainRouter.getRouter());
  }

  private handleError() {
    this.app.use(errorMiddleware);
  }
  public run() {
    this.app.listen(this.PORT, () => {
      console.log(`Server running`);
    });
  }
}
