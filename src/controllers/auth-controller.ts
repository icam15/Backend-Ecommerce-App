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
import {
  generateAuthToken,
  verifyRefreshToken,
} from "../utils/token/auth-token";

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
      const { email, userId, role } = await AuthService.verifyAccount(
        payload.token
      );
      const { accessToken, refreshToken } = generateAuthToken({
        email,
        id: userId,
        role,
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
  }

  async sigInUser(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = validate(
        AuthValidation.signInUserValidation,
        req.body as SignUpUserPayload
      );
      const { email, userId, role } = await AuthService.signInUser(payload);
      const { accessToken, refreshToken } = generateAuthToken({
        email,
        id: userId,
        role,
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

  async getUserSession(req: Request, res: Response, next: NextFunction) {
    try {
      const session = req.user;
      const result = await AuthService.getUserSession(
        session.id,
        session.email
      );
      res.status(200).json({
        status: "success",
        message: "Get session success",
        result,
      });
    } catch (e) {
      next(e);
    }
  }

  async getRefreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { ecm_app_AT } = req.cookies;
      const { email, id } = verifyRefreshToken(ecm_app_AT);
    } catch (e) {
      next(e);
    }
  }

  async signUpUserWithGoogle() {}
  async redirectGoogleOauth() {}
  async logoutUser() {}
}
