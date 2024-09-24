import { config } from "dotenv";

config();
async function main() {
  try {
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
    const listProvince = jsonProvince.rajaongkir.results;
    console.log(listProvince);

    // get list of cities
    const getListCities = await fetch(`${rajaOngkirBaseUrl}/city`, {
      method: "GET",
      headers: headers,
    });
    const jsonCities = await getListCities.json();
    const listCities = jsonCities.rajaongkir.results;
    console.log(listCities);
  } catch (e) {
    console.log(e);
  }
}

main();
