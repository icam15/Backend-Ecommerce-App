import { config } from "dotenv";
config();

export const getPaymentLink = async (data: any) => {
  const secret = process.env.MIDTRANS_SERVER_KEY! as string;
  const encodedSecret = Buffer.from(secret).toString("base64");
  const AUTH_STRING = `Basic ${encodedSecret}`;
  const response = await fetch(`${process.env.MIDTRANS_URL!}`, {
    method: "POST",
    headers: {
      "Access-Control-Allow-Origin": "true",
      Accept: "application/json",
      "Content-type": "application/json",
      Authorization: AUTH_STRING,
    },
    body: JSON.stringify(data),
  });
  const paymentLink = await response.json();
  return paymentLink;
};
