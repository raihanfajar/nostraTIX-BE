/*
  Warnings:

  - Added the required column `maxDiscount` to the `Coupon` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxDiscount` to the `Voucher` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "nostratix"."Coupon" ADD COLUMN     "maxDiscount" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "nostratix"."Voucher" ADD COLUMN     "maxDiscount" INTEGER NOT NULL;
