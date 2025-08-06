/*
  Warnings:

  - Added the required column `expiryAt` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ticketEventCategoryId` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "nostratix"."Ticket" ALTER COLUMN "qrCode" SET DEFAULT 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/QR_Code_Example.svg/368px-QR_Code_Example.svg.png';

-- AlterTable
ALTER TABLE "nostratix"."Transaction" ADD COLUMN     "expiryAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "ticketEventCategoryId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "nostratix"."Transaction" ADD CONSTRAINT "Transaction_ticketEventCategoryId_fkey" FOREIGN KEY ("ticketEventCategoryId") REFERENCES "nostratix"."TicketEventCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
