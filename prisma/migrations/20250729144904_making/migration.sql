-- DropForeignKey
ALTER TABLE "Coupon" DROP CONSTRAINT "Coupon_onlyForId_fkey";

-- AlterTable
ALTER TABLE "Coupon" ALTER COLUMN "onlyForId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_onlyForId_fkey" FOREIGN KEY ("onlyForId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
