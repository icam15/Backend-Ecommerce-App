import { ResponseError } from "../helpers/response-error";
import { prisma } from "../libs/prisma";

export class ShippingService {
  static async getCities() {
    const findCities = await prisma.city.findMany();
    if (!findCities) {
      throw new ResponseError(400, "city not found");
    }
    return findCities;
  }

  static async getProvince() {
    const findProvince = await prisma.province.findMany();
    if (!findProvince) {
      throw new ResponseError(400, "province not found");
    }
    return findProvince;
  }
}
