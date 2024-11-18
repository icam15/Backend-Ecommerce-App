/*
  Warnings:

  - You are about to drop the column `order_id` on the `order_store` table. All the data in the column will be lost.
  - You are about to drop the column `shipping_cost` on the `order_store` table. All the data in the column will be lost.
  - You are about to drop the `order` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `user_id` to the `order_store` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wrapper_order_id` to the `order_store` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `service` on the `order_store` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "OrderPaymentStatus" AS ENUM ('WAITING_FOR_PAYMENT', 'ALREADY_PAID');

-- DropForeignKey
ALTER TABLE "order" DROP CONSTRAINT "order_user_id_fkey";

-- DropForeignKey
ALTER TABLE "order_item" DROP CONSTRAINT "order_item_order_store_id_fkey";

-- DropForeignKey
ALTER TABLE "order_store" DROP CONSTRAINT "order_store_order_id_fkey";

-- DropForeignKey
ALTER TABLE "order_store" DROP CONSTRAINT "order_store_store_voucher_id_fkey";

-- AlterTable
ALTER TABLE "order_store" DROP COLUMN "order_id",
DROP COLUMN "shipping_cost",
ADD COLUMN     "order_status" "OrderStatus" NOT NULL DEFAULT 'WAITING_FOR_PAYMENT',
ADD COLUMN     "user_id" INTEGER NOT NULL,
ADD COLUMN     "wrapper_order_id" INTEGER NOT NULL,
ALTER COLUMN "store_voucher_id" DROP NOT NULL,
DROP COLUMN "service",
ADD COLUMN     "service" TEXT NOT NULL;

-- DropTable
DROP TABLE "order";

-- CreateTable
CREATE TABLE "wrapper_order" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "note" TEXT,
    "order_payment_status" "OrderPaymentStatus" NOT NULL,
    "total_price" INTEGER NOT NULL,
    "shipping_cost" INTEGER NOT NULL,
    "discount_products" INTEGER,
    "discount_shipping_cost" INTEGER,
    "total_payment" INTEGER NOT NULL,
    "payment_link" TEXT,
    "payment_proof" TEXT,
    "delete_at" TIMESTAMP(3),
    "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wrapper_order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_OrderToOrderItem" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_OrderToOrderItem_AB_unique" ON "_OrderToOrderItem"("A", "B");

-- CreateIndex
CREATE INDEX "_OrderToOrderItem_B_index" ON "_OrderToOrderItem"("B");

-- AddForeignKey
ALTER TABLE "wrapper_order" ADD CONSTRAINT "wrapper_order_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_store" ADD CONSTRAINT "order_store_store_voucher_id_fkey" FOREIGN KEY ("store_voucher_id") REFERENCES "voucher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_store" ADD CONSTRAINT "order_store_wrapper_order_id_fkey" FOREIGN KEY ("wrapper_order_id") REFERENCES "wrapper_order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_store" ADD CONSTRAINT "order_store_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrderToOrderItem" ADD CONSTRAINT "_OrderToOrderItem_A_fkey" FOREIGN KEY ("A") REFERENCES "order_store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrderToOrderItem" ADD CONSTRAINT "_OrderToOrderItem_B_fkey" FOREIGN KEY ("B") REFERENCES "order_item"("id") ON DELETE CASCADE ON UPDATE CASCADE;
