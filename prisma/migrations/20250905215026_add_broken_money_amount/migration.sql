/*
  Warnings:

  - Added the required column `brokenMoneyAmount` to the `Report` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Report" ADD COLUMN     "brokenMoneyAmount" DOUBLE PRECISION NOT NULL;
