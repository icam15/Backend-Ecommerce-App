import { NextFunction, Request, Response } from "express";
import { validate } from "../validation/validation";
import { AddressValidation } from "../validation/address-validation";
import { CreateUserAddressPayload } from "../types/address-types";
import { AddressService } from "../services/address-service";

export class AddressController {
  async createAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const session = req.user;
      const payload = validate(
        AddressValidation.createUserAddressValidation,
        req.body as CreateUserAddressPayload
      );
      const result = await AddressService.createUserAddress(
        payload,
        session.id
      );
      res.status(201).json({
        status: "success",
        message: "create user address is succeessfully",
        result,
      });
    } catch (e) {
      next(e);
    }
  }
}
