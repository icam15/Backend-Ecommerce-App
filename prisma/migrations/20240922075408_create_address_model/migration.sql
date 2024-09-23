/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserToken` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserToken" DROP CONSTRAINT "UserToken_user_id_fkey";

-- DropTable
DROP TABLE "User";

-- DropTable
DROP TABLE "UserToken";

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "image_url" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "dispaly_name" VARCHAR(12) NOT NULL,
    "isVerified" "UserStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "phone_number" TEXT,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_token" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "verify_token" TEXT,
    "reset_password_token" TEXT,
    "refresh_token" TEXT,
    "refreshToken_exp" TIMESTAMP(3)
);

-- CreateTable
CREATE TABLE "address" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "home_phone" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "isMainAddress" BOOLEAN NOT NULL DEFAULT false,
    "postal_code" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "address_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_token_id_key" ON "user_token"("id");

-- CreateIndex
CREATE UNIQUE INDEX "user_token_user_id_key" ON "user_token"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "address_user_id_key" ON "address"("user_id");

-- AddForeignKey
ALTER TABLE "user_token" ADD CONSTRAINT "user_token_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "address" ADD CONSTRAINT "address_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
