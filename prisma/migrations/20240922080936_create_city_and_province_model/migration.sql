/*
  Warnings:

  - You are about to drop the column `city` on the `address` table. All the data in the column will be lost.
  - You are about to drop the column `province` on the `address` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cityId]` on the table `address` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[provinceId]` on the table `address` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cityId` to the `address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `provinceId` to the `address` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CityType" AS ENUM ('KABUPATEN', 'KOTA');

-- DropIndex
DROP INDEX "user_token_id_key";

-- AlterTable
ALTER TABLE "address" DROP COLUMN "city",
DROP COLUMN "province",
ADD COLUMN     "cityId" INTEGER NOT NULL,
ADD COLUMN     "provinceId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "user_token" ADD CONSTRAINT "user_token_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "City" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "city_type" "CityType" NOT NULL,
    "provinceId" INTEGER NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Province" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Province_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "City_provinceId_key" ON "City"("provinceId");

-- CreateIndex
CREATE UNIQUE INDEX "address_cityId_key" ON "address"("cityId");

-- CreateIndex
CREATE UNIQUE INDEX "address_provinceId_key" ON "address"("provinceId");

-- AddForeignKey
ALTER TABLE "address" ADD CONSTRAINT "address_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "Province"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "address" ADD CONSTRAINT "address_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "Province"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
