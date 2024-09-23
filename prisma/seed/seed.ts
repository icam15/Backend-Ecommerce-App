import { listCities } from "../models/cities";
import { listProvinces } from "../models/province";

async function main() {
  const cities = await listCities();
  console.log(cities);

  const province = await listProvinces();
  console.log(province);
}

main();
