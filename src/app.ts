import express, { Express, NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import { config } from "dotenv";

config();
export class App {
  private app: Express;
  private PORT = process.env.PORT;
  constructor() {
    this.app = express();
    this.configuration();
  }
  private configuration() {
    this.app.use(express.json());
    this.app.use(cookieParser());
    this.app.get("/test", (req: Request, res: Response, next: NextFunction) => {
      res.send("Test successfully");
    });
  }
  private routes() {}
  private handleError() {}
  public run() {
    this.app.listen(this.PORT, () => {
      console.log(`Server running on `);
    });
  }
}
