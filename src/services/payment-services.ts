import { OrderItem, OrderStatus } from "@prisma/client";
import { ResponseError } from "../helpers/response-error";
import { prisma } from "../libs/prisma";
import { PaymentTransactionStatusPayload } from "../types/payment-types";

export class PaymentService {
  static async updateOrderStatus(payload: PaymentTransactionStatusPayload) {
    const order = await prisma.order.findUnique({
      where: { id: payload.order_id },
      include: {
        orderItem: true,
      },
    });
    if (!order) {
      throw new ResponseError(404, "order not found");
    }
    if (payload.transaction_status === "settlement") {
      await prisma.order.update({
        where: {
          id: order.id,
        },
        data: {
          orderStatus: OrderStatus.WAITING_FOR_CONFIRMATION,
        },
      });
    } else if (
      payload.transaction_status === "cancel" ||
      payload.transaction_status === "expire" ||
      payload.transaction_status === "deny"
    ) {
      await prisma.order.update({
        where: {
          id: order.id,
        },
        data: {
          orderStatus: OrderStatus.CANCELLED,
        },
      });
      await this.updateStockProductForFailedTransaction(order.orderItem);
    }
  }

  static async updateStockProductForFailedTransaction(items: OrderItem[]) {
    for (const item of items) {
      await prisma.stock.update({
        where: {
          productId: item.productId,
        },
        data: {
          amount: { increment: item.quantity },
        },
      });
    }
  }
}
