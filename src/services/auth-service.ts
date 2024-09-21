import { ResponseError } from "../helpers/response-error";
import { prisma } from "../libs/prisma";
import {
  ForgotPasswordPayload,
  SignInUserPayload,
  SignUpUserPayload,
} from "../types/auth-types";
import dayjs from "dayjs";
import {
  generateVerifyAccountToken,
  verifyToken,
} from "../utils/token/verify-token";
import { comparePassword, hashPassword } from "../helpers/bcrypt";
import { sendVerifyAccountLink } from "../utils/emails/email";
import { Response } from "express";
import { logger } from "../libs/logger";

export class AuthService {
  static async signUpUser(
    payload: SignUpUserPayload
  ): Promise<{ email: string }> {
    // 1. check if user Exist
    const existUser = await prisma.user.count({
      where: {
        email: payload.email,
      },
    });

    // hash password
    const hashedPassword = await hashPassword(payload.password);
    if (existUser > 0) {
      throw new ResponseError(400, "This email was already exist in our data");
    }

    // create new user
    const user = await prisma.user.create({
      data: {
        displayName: payload.username,
        email: payload.email,
        password: hashedPassword,
      },
    });

    // create verify account token and the expired time
    const expiredToken = dayjs().add(1, "hour").toDate();
    const { token } = generateVerifyAccountToken({
      userId: user.id,
      email: user.email,
      expiredAt: expiredToken,
    });

    // attach token to user
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        userToken: { create: { verifyToken: token } },
      },
    });

    // send verify account link through email
    sendVerifyAccountLink(token, user.email);
    return { email: user.email };
  }

  static async verifyAccount(
    token: string
  ): Promise<{ userId: number; email: string }> {
    // get expired and email from decode the token
    const { expiredAt, email } = verifyToken(token);

    // check the user in database by the email and the expired
    const existUser = await prisma.user.findUnique({
      where: {
        email,
      },
      include: { userToken: true },
    });
    if (!existUser || !existUser.userToken) {
      throw new ResponseError(403, "account or token not found");
    }
    logger.info(existUser);
    console.log(existUser);
    if (dayjs(expiredAt).isBefore(dayjs())) {
      throw new ResponseError(400, "Token expired");
    }

    if (existUser.isVerified === "VERIFIED") {
      throw new ResponseError(400, "your account was verified");
    }

    // update status user to be VERIFIED
    await prisma.user.update({
      where: {
        id: existUser!.id,
      },
      data: {
        isVerified: "VERIFIED",
      },
    });

    return { email: existUser!.email, userId: existUser!.id };
  }

  static async sendAuthToken(
    accessToken: string,
    refreshToken: string,
    res: Response
  ): Promise<void> {
    // Access Token
    res.cookie("ecm_app_AT", accessToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60,
      sameSite: "none",
      path: "/",
    });

    // Refresh Token
    res.cookie("ecm_app_RT", refreshToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
      sameSite: "none",
      path: "/",
    });
  }

  static async signInUser(
    payload: SignInUserPayload
  ): Promise<{ email: string; userId: number }> {
    // check user exist
    const existUser = await prisma.user.findUnique({
      where: {
        email: payload.email,
      },
      include: { userToken: true },
    });
    if (!existUser) {
      throw new ResponseError(400, "account not found");
    }
    if (existUser.isVerified === "UNVERIFIED") {
      throw new ResponseError(400, "account was not verified");
    }

    // compare hashed password in db
    const isPasswordValid = await comparePassword(
      payload.password,
      existUser?.password!
    );
    if (!isPasswordValid) {
      throw new ResponseError(400, "email or password are wrong");
    }

    return { email: existUser.email, userId: existUser.id };
  }

  static async forgotPassword(
    payload: ForgotPasswordPayload
  ): Promise<{ email: string }> {
    // check exist user
    const existUser = await prisma.user.findUnique({
      where: {
        email: payload.email,
      },
      include:{userToken:true}
    });
    if (!existUser) throw new ResponseError(400, "account not found");
    if(existUser)
    // send token reset password and the expired
  }
}
