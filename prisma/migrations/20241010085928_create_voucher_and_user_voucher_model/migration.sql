/*
  Warnings:

  - Added the required column `store_id` to the `cart_item` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "VoucherType" AS ENUM ('PRODUCT_PRICE', 'SHIPPING_COST');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('FIXED_DISCOUNT', 'PERCENT_DISCOUNT');

-- AlterTable
ALTER TABLE "cart_item" ADD COLUMN     "is_selected" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "store_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "voucher" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "discount" INTEGER NOT NULL,
    "voucher_type" "VoucherType" NOT NULL,
    "discount_type" "DiscountType" NOT NULL,
    "is_claimable" BOOLEAN NOT NULL,
    "store_id" INTEGER,
    "store_admin_id" INTEGER,
    "ecommerce_admin_id" INTEGER,
    "min_order_item" INTEGER NOT NULL DEFAULT 0,
    "min_order_price" INTEGER NOT NULL DEFAULT 0,
    "expire_at" TIMESTAMP(3) NOT NULL,
    "create_at" TIMESTAMP(3) NOT NULL,
    "update_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "voucher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_voucher" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "voucher_id" INTEGER NOT NULL,
    "is_used" BOOLEAN NOT NULL,
    "expire_at" TIMESTAMP(3) NOT NULL,
    "create_at" TIMESTAMP(3) NOT NULL,
    "update_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_voucher_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voucher" ADD CONSTRAINT "voucher_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voucher" ADD CONSTRAINT "voucher_store_admin_id_fkey" FOREIGN KEY ("store_admin_id") REFERENCES "store_admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voucher" ADD CONSTRAINT "voucher_ecommerce_admin_id_fkey" FOREIGN KEY ("ecommerce_admin_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_voucher" ADD CONSTRAINT "user_voucher_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_voucher" ADD CONSTRAINT "user_voucher_voucher_id_fkey" FOREIGN KEY ("voucher_id") REFERENCES "voucher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
