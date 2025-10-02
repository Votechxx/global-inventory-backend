/*
  Warnings:

  - You are about to drop the column `selledUnits` on the `ReportProduct` table. All the data in the column will be lost.
  - You are about to drop the column `selledUnitsAmount` on the `ReportProduct` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."ReportProduct" DROP COLUMN "selledUnits",
DROP COLUMN "selledUnitsAmount",
ADD COLUMN     "soldUnits" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "soldUnitsAmount" DOUBLE PRECISION NOT NULL DEFAULT 0;
