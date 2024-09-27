import { config } from "dotenv";
import { CityType, PrismaClient } from "@prisma/client";
import { listCities } from "../models/cities";
import { listProvinces } from "../models/province";
config();

type Province = {
  province: string;
  province_id: string;
};

type City = {
  city_id: string;
  province: string;
  province_id: string;
  type: string;
  city_name: string;
  postal_code: string;
};

const prisma = new PrismaClient();

async function main() {
  try {
    // const listProvince = await listProvinces();
    // listProvince.map(async (province: Province, index) => {
    //   return await prisma.province.create({
    //     data: {
    //       id: index + 1,
    //       name: province.name,
    //     },
    //   });
    // });

    // // await prisma.city.create({});

    // const listCity: City[] = await listCities();
    // listCity.map(async (city: City, index) => {
    //   return prisma.city.create({
    //     data: {
    //       id: index + 1,
    //       cityType: city.type,
    //       name: city.name,
    //       provinceId: city.provinceId,
    //     },
    //   });
    // });

    // Promise.all([listProvince, listCity]);

    const rajaOngkirApiKey = process.env.RAJA_ONGKIR_API_KEY!;
    const rajaOngkirBaseUrl = process.env.RAJA_ONGKIR_BASE_URL!;
    const headers = new Headers();
    headers.append("key", rajaOngkirApiKey);
    // get list of province
    const getListProvince = await fetch(`${rajaOngkirBaseUrl}/province`, {
      method: "GET",
      headers: headers,
    });
    const jsonProvince = await getListProvince.json();
    const listProvince: Province[] = jsonProvince.rajaongkir.results;
    for (const province of listProvince) {
      await prisma.province.create({
        data: {
          id: parseInt(province.province_id),
          name: province.province,
        },
      });
    }

    // get list of cities
    const getListCities = await fetch(`${rajaOngkirBaseUrl}/city`, {
      method: "GET",
      headers: headers,
    });
    const jsonCities = await getListCities.json();
    const listCities: City[] = jsonCities.rajaongkir.results;
    for (const city of listCities) {
      await prisma.city.create({
        data: {
          id: parseInt(city.city_id),
          cityType: city.type === "Kabupaten" ? "KABUPATEN" : "KOTA",
          provinceId: parseInt(city.province_id),
          name: city.city_name,
        },
      });
    }
  } catch (e) {
    console.log(e);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.log(e);
    await prisma.$disconnect();
    process.exit();
  });
