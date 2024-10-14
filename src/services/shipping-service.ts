import { response } from "express";
import { ResponseError } from "../helpers/response-error";
import { prisma } from "../libs/prisma";
import { GetShippingCostPayload } from "../types/shipping-types";

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

  static async getShippingCost(paylod: GetShippingCostPayload) {
    const url = "https://api.rajaongkir.com/starter/cost";
    const rajaOngkirApiKey = process.env.RAJA_ONGKIR_API_KEY!;
    if (!rajaOngkirApiKey) {
      throw new ResponseError(500, "raja ongkir api key is not set");
    }
    const headers = {
      key: rajaOngkirApiKey,
      "content-type": "application/x-www-form-urlencoded",
    };
    const body = new URLSearchParams({
      origin: String(paylod.origin),
      destination: String(paylod.destination),
      weight: String(paylod.weight),
      courier: paylod.courier,
    });

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: body.toString(),
    });
    if (!response.ok) {
      throw new ResponseError(
        response.status,
        "Error get shipping cost from raja ongkir"
      );
    }
    console.log(response.statusText);
    const data = await response.json();
    const cost = data.rajaongkir.results[0].costs;

    return { cost };
  }
}
