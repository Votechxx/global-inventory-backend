/*
  Warnings:

  - The values [IN_TRANSIT,DELIVERED,CANCELLED] on the enum `StatusShipmentEnum` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `expenseId` on the `Shipment` table. All the data in the column will be lost.
  - You are about to drop the column `statys` on the `Shipment` table. All the data in the column will be lost.
  - You are about to alter the column `title` on the `Shipment` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."StatusShipmentEnum_new" AS ENUM ('PENDING', 'PENDING_REVIEW', 'ACCEPTED');
ALTER TABLE "public"."Shipment" ALTER COLUMN "statys" DROP DEFAULT;
ALTER TABLE "public"."Shipment" ALTER COLUMN "status" TYPE "public"."StatusShipmentEnum_new" USING ("status"::text::"public"."StatusShipmentEnum_new");
ALTER TYPE "public"."StatusShipmentEnum" RENAME TO "StatusShipmentEnum_old";
ALTER TYPE "public"."StatusShipmentEnum_new" RENAME TO "StatusShipmentEnum";
DROP TYPE "public"."StatusShipmentEnum_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."Shipment" DROP CONSTRAINT "Shipment_expenseId_fkey";

-- AlterTable
ALTER TABLE "public"."Shipment" DROP COLUMN "expenseId",
DROP COLUMN "statys",
ADD COLUMN     "isWaitingForChanges" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" "public"."StatusShipmentEnum" NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "title" SET DATA TYPE VARCHAR(255);

-- CreateTable
CREATE TABLE "public"."ShipmentExpense" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "shipmentId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "tag" "public"."ExpenseTag" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShipmentExpense_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShipmentExpense_uuid_key" ON "public"."ShipmentExpense"("uuid");

-- AddForeignKey
ALTER TABLE "public"."ShipmentExpense" ADD CONSTRAINT "ShipmentExpense_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "public"."Shipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
