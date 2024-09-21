import { NextFunction, Request, Response } from "express";
import { AuthService } from "../services/auth-service";
import { validate } from "../validation/validation";
import { AuthValidation } from "../validation/auth-vaildation";
import {
  AuthJwtPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  SignUpUserPayload,
  verifyAccountPayload,
} from "../types/auth-types";
import { logger } from "../libs/logger";
import { generateAuthToken } from "../utils/token/auth-token";

export class AuthController {
  async signUpUser(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = validate(
        AuthValidation.signUpUserValidation,
        req.body as SignUpUserPayload
      );
      const { email } = await AuthService.signUpUser(payload);
      res.status(201).json({
        status: "success",
        message: `User created, verifcation link was send to ${email}`,
      });
    } catch (e) {
      next(e);
    }
  }

  async verifyAccountUser(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = validate(
        AuthValidation.verifyAccountValidation,
        req.body as verifyAccountPayload
      );
      const { email, userId } = await AuthService.verifyAccount(payload.token);
      const { accessToken, refreshToken } = generateAuthToken({
        email,
        id: userId,
      });
      logger.info(accessToken, refreshToken);
      await AuthService.sendAuthToken(accessToken, refreshToken, res);
      res.status(201).json({
        status: "success",
        message: "account verification succesfully",
      });
    } catch (e) {
      next(e);
    }

  async sigInUser(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = validate(
        AuthValidation.signInUserValidation,
        req.body as SignUpUserPayload
      );
      const { email, userId } = await AuthService.signInUser(payload);
      const { accessToken, refreshToken } = generateAuthToken({
        email,
        id: userId,
      });
      await AuthService.sendAuthToken(accessToken, refreshToken, res);
      res.status(201).json({
        status: "success",
        message: "logged in succesfully",
      });
    } catch (e) {
      next(e);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = validate(
        AuthValidation.forgotPasswordValidation,
        req.body as ForgotPasswordPayload
      );
      const { email } = await AuthService.forgotPassword(payload);
      res.status(201).json({
        status: "success",
        message: `reset password link was send to ${email}`,
      });
    } catch (e) {
      next(e);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = validate(
        AuthValidation.resetPasswordValidation,
        req.body as ResetPasswordPayload
      );
      await AuthService.resetPassword(payload);
      res.status(201).json({
        status: "success",
        message: "new password was success created",
      });
    } catch (e) {
      next(e);
    }
  }

  async getUserSession() {}
  async getRefreshToken() {}

  async signUpUserWithGoogle() {}
  async redirectGoogleOauth() {}
  async logoutUser() {}
}
