/*
  Warnings:

  - Added the required column `city_name` to the `address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `province_name` to the `address` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "City_provinceId_key";

-- DropIndex
DROP INDEX "address_cityId_key";

-- DropIndex
DROP INDEX "address_provinceId_key";

-- DropIndex
DROP INDEX "address_user_id_key";

-- AlterTable
ALTER TABLE "City" ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "City_id_seq";

-- AlterTable
ALTER TABLE "Province" ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "Province_id_seq";

-- AlterTable
ALTER TABLE "address" ADD COLUMN     "city_name" TEXT NOT NULL,
ADD COLUMN     "province_name" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "icon_url" TEXT,
    "ecommerce_admin_id" INTEGER NOT NULL,
    "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_ecommerce_admin_id_fkey" FOREIGN KEY ("ecommerce_admin_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
