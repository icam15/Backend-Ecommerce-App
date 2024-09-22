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
import { oauthUrl } from "../libs/oauth2/googleClient";

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
      await AuthService.saveRefreshToken(refreshToken, userId);
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
      await AuthService.saveRefreshToken(refreshToken, userId);
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
      const { ecm_app_RT } = req.cookies;
      const { email, id, role } = verifyRefreshToken(ecm_app_RT);
      const { accessToken, refreshToken } = generateAuthToken({
        email,
        id,
        role,
      });
      await AuthService.getRefreshToken(id, email);
      await AuthService.saveRefreshToken(refreshToken, id);
      await AuthService.sendAuthToken(accessToken, refreshToken, res);
      res.status(201).json({
        status: "success",
        message: "success created new refresh token",
      });
    } catch (e) {
      next(e);
    }
  }

  async logoutUser(req: Request, res: Response, next: NextFunction) {
    try {
      const session = req.user;
      await AuthService.logout(session.id);
      res.clearCookie("ecm_app_AT");
      res.clearCookie("ecm_app_RT");
      res.status(201).json({
        status: "success",
        message: "logged out success",
      });
    } catch (e) {
      next(e);
    }
  }

  async signUpWithGoogle(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(301).redirect(oauthUrl);
    } catch (e) {
      next(e);
    }
  }

  async callbackGoogleOauth(
    req: Request<{}, {}, {}, { code: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { code } = req.query;
      const { email, role, userId } = await AuthService.handleSignUpWithGoogle(
        code
      );
      const { accessToken, refreshToken } = generateAuthToken({
        email,
        role,
        id: userId,
      });
      await AuthService.sendAuthToken(accessToken, refreshToken, res);
      await AuthService.saveRefreshToken(refreshToken, userId);
      res.status(201).json({
        status: "success",
        message: "sign up with google is success",
      });
    } catch (e) {
      next(e);
    }
  }
}
