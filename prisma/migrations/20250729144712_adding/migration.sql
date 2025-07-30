/*
  Warnings:

  - Added the required column `onlyForId` to the `Coupon` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Coupon" ADD COLUMN     "onlyForId" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_onlyForId_fkey" FOREIGN KEY ("onlyForId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
