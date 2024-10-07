/*
  Warnings:

  - Added the required column `storeId` to the `product_image` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updaeteAt` to the `product_image` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "product_image" DROP CONSTRAINT "product_image_productId_fkey";

-- DropForeignKey
ALTER TABLE "stock" DROP CONSTRAINT "stock_productId_fkey";

-- DropForeignKey
ALTER TABLE "store_admin" DROP CONSTRAINT "store_admin_storeId_fkey";

-- DropForeignKey
ALTER TABLE "user_token" DROP CONSTRAINT "user_token_user_id_fkey";

-- AlterTable
ALTER TABLE "product" ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "discount_price" DROP NOT NULL,
ALTER COLUMN "store_etalase_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "product_image" ADD COLUMN     "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "storeId" INTEGER NOT NULL,
ADD COLUMN     "updaeteAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "store_etalase" (
    "id" SERIAL NOT NULL,
    "storeId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "icon_url" TEXT NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_etalase_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "user_token" ADD CONSTRAINT "user_token_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_admin" ADD CONSTRAINT "store_admin_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_store_etalase_id_fkey" FOREIGN KEY ("store_etalase_id") REFERENCES "store_etalase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_image" ADD CONSTRAINT "product_image_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_image" ADD CONSTRAINT "product_image_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock" ADD CONSTRAINT "stock_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_etalase" ADD CONSTRAINT "store_etalase_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
