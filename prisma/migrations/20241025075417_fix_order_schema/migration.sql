/*
  Warnings:

  - You are about to drop the column `service` on the `order` table. All the data in the column will be lost.
  - Added the required column `weight` to the `cart_item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `courier` to the `order_store` table without a default value. This is not possible if the table is not empty.
  - Added the required column `service` to the `order_store` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ShippingServiceType" AS ENUM ('REG', 'SPS', 'YES', 'OKE');

-- CreateEnum
CREATE TYPE "CourierType" AS ENUM ('JNE', 'POS', 'SICEPAT');

-- AlterTable
ALTER TABLE "cart_item" ADD COLUMN     "weight" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "order" DROP COLUMN "service",
ALTER COLUMN "discount_products" DROP NOT NULL,
ALTER COLUMN "discount_shipping_cost" DROP NOT NULL,
ALTER COLUMN "payment_link" DROP NOT NULL;

-- AlterTable
ALTER TABLE "order_store" ADD COLUMN     "courier" "CourierType" NOT NULL,
ADD COLUMN     "service" "ShippingServiceType" NOT NULL;
