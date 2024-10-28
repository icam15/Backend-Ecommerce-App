import { config } from "dotenv";
import { ResponseError } from "../response-error";
config();

export const getPaymentLink = async (data: any) => {
  console.log(data);
  const secret = process.env.MIDTRANS_SERVER_KEY as string;
  const encodedSecret = Buffer.from(secret).toString("base64");
  const AUTH_STRING = `Basic ${encodedSecret}`;
  console.log(JSON.stringify(data));
  const response = await fetch(
    "https://api.sandbox.midtrans.com/v1/payment-links",
    {
      method: "POST",
      headers: {
        // "Access-Control-Allow-Origin": "true",
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: AUTH_STRING,
      },
      body: JSON.stringify(data),
    }
  );
  console.log(response);
  if (!response.ok) {
    throw new ResponseError(response.status, response.statusText);
  }
  const paymentLink = await response.json();
  return paymentLink;
};

export const createPaymentLinkData = (
  orderId: number,
  totalPayment: number
) => {
  return {
    transaction_details: {
      order_id: String(orderId),
      gross_amount: totalPayment,
    },
    expiry: { unit: "minutes", duration: 10 },
  };
};

export const createPaymentLink = async (
  orderId: number,
  totalPayment: number
) => {
  const data = createPaymentLinkData(orderId, totalPayment);
  const paymentResponse = await getPaymentLink(data);
  const paymentLink = paymentResponse.payment_url;
  return paymentLink;
};
