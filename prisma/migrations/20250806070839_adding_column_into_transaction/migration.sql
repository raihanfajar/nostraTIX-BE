/*
  Warnings:

  - Added the required column `point` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "nostratix"."Transaction" ADD COLUMN     "point" INTEGER NOT NULL;
