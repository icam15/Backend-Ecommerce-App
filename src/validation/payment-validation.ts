import { z } from "zod";

export class PaymentValidation {
  static readonly paymentTransactionStatusValidation = z.object({
    order_id: z.number(),
    transaction_status: z.string(),
  });
}
