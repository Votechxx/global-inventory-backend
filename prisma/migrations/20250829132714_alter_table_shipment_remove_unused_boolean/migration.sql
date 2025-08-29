/*
  Warnings:

  - You are about to drop the column `isWaitingForChanges` on the `Shipment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Shipment" DROP COLUMN "isWaitingForChanges";
