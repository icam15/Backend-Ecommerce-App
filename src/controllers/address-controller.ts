import { NextFunction, Request, Response } from "express";
import { validate } from "../validation/validation";
import { AddressValidation } from "../validation/address-validation";
import {
  CreateUserAddressPayload,
  UpdateUserAddressPayload,
} from "../types/address-types";
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

  async updateAddress(
    req: Request<{ addressId: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { addressId } = req.params;
      const session = req.user;
      const payload = validate(
        AddressValidation.updateUserAddressValidation,
        req.body as UpdateUserAddressPayload
      );
      const result = await AddressService.updateAddress(
        session.id,
        parseInt(addressId),
        payload
      );
      res.status(201).json({
        status: "success",
        message: "update user address is successfully",
        result,
      });
    } catch (e) {
      next(e);
    }
  }

  async setMainAddress(
    req: Request<{ addressId: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const session = req.user;
      const { addressId } = req.params;
      await AddressService.setMainUserAddress(session.id, parseInt(addressId));
      res.status(201).json({
        status: "success",
        message: "update address to main addres is succesfully",
      });
    } catch (e) {
      next(e);
    }
  }
}
