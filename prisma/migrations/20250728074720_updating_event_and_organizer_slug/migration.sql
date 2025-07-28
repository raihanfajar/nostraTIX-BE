/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Organizer` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Organizer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Organizer" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Organizer_slug_key" ON "Organizer"("slug");
