/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `store` table. All the data in the column will be lost.
  - You are about to drop the column `postalCode` on the `store` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "store" DROP COLUMN "imageUrl",
DROP COLUMN "postalCode",
ADD COLUMN     "image_url" TEXT,
ADD COLUMN     "postal_code" TEXT,
ALTER COLUMN "description" DROP NOT NULL;

-- CreateTable
CREATE TABLE "store_admin" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "storeId" INTEGER NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_admin_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "store_admin" ADD CONSTRAINT "store_admin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_admin" ADD CONSTRAINT "store_admin_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
