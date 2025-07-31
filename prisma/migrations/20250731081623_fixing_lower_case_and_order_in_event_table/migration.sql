/*
  Warnings:

  - Made the column `countryId` on table `events` required. This step will fail if there are existing NULL values in that column.
  - Made the column `cityId` on table `events` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "nostratix"."events" DROP CONSTRAINT "events_cityId_fkey";

-- DropForeignKey
ALTER TABLE "nostratix"."events" DROP CONSTRAINT "events_countryId_fkey";

-- AlterTable
ALTER TABLE "nostratix"."events" ALTER COLUMN "countryId" SET NOT NULL,
ALTER COLUMN "cityId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "nostratix"."events" ADD CONSTRAINT "events_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "nostratix"."countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nostratix"."events" ADD CONSTRAINT "events_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "nostratix"."cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
