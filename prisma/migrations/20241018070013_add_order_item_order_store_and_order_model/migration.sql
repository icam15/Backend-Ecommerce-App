/*
  Warnings:

  - Added the required column `stock` to the `voucher` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('WAITING_FOR_PAYMENT', 'WAITING_FOR_CONFIRMATION', 'SHIPPING', 'PROCESS', 'DELIVERED', 'CONFIRMED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "user_voucher" DROP CONSTRAINT "user_voucher_voucher_id_fkey";

-- AlterTable
ALTER TABLE "user_voucher" ALTER COLUMN "create_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "voucher" ADD COLUMN     "stock" INTEGER NOT NULL,
ALTER COLUMN "code" DROP NOT NULL,
ALTER COLUMN "create_at" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "order" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "service" TEXT NOT NULL,
    "estimation" TEXT NOT NULL,
    "note" TEXT,
    "order_status" "OrderStatus" NOT NULL,
    "total_price" INTEGER NOT NULL,
    "shipping_cost" INTEGER NOT NULL,
    "discount_products" INTEGER NOT NULL,
    "discount_shipping_cost" INTEGER NOT NULL,
    "total_payment" INTEGER NOT NULL,
    "payment_link" TEXT NOT NULL,
    "delete_at" TIMESTAMP(3),
    "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_store" (
    "id" SERIAL NOT NULL,
    "store_id" INTEGER NOT NULL,
    "order_id" INTEGER NOT NULL,
    "discount_products" INTEGER NOT NULL,
    "store_voucher_id" INTEGER NOT NULL,
    "shipping_cost" INTEGER NOT NULL,
    "total_price" INTEGER NOT NULL,
    "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_item" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "order_store_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "order_item_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "user_voucher" ADD CONSTRAINT "user_voucher_voucher_id_fkey" FOREIGN KEY ("voucher_id") REFERENCES "voucher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_store" ADD CONSTRAINT "order_store_store_voucher_id_fkey" FOREIGN KEY ("store_voucher_id") REFERENCES "voucher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_store" ADD CONSTRAINT "order_store_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_store" ADD CONSTRAINT "order_store_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_order_store_id_fkey" FOREIGN KEY ("order_store_id") REFERENCES "order_store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
