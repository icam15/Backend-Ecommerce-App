/*
  Warnings:

  - You are about to drop the column `reset_password_token_exp` on the `UserToken` table. All the data in the column will be lost.
  - You are about to drop the column `verify_token_exp` on the `UserToken` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "image_url" DROP NOT NULL,
ALTER COLUMN "phone_number" DROP NOT NULL;

-- AlterTable
ALTER TABLE "UserToken" DROP COLUMN "reset_password_token_exp",
DROP COLUMN "verify_token_exp",
ALTER COLUMN "verify_token" DROP NOT NULL,
ALTER COLUMN "reset_password_token" DROP NOT NULL;
