-- CreateEnum
CREATE TYPE "public"."StatusShipmentEnum" AS ENUM ('PENDING', 'PENDING_REVIEW', 'ACCEPTED');

-- AlterTable
ALTER TABLE "public"."Inventory" ADD COLUMN     "currentBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "deposit" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "expenses" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "totalBalance" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "public"."Shipment" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "numberOfTrucks" INTEGER NOT NULL DEFAULT 1,
    "status" "public"."StatusShipmentEnum" NOT NULL DEFAULT 'PENDING',
    "inventoryId" INTEGER NOT NULL,
    "isWaitingForChanges" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ShipmentExpense" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "shipmentId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "tag" "public"."ExpenseTag",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShipmentExpense_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Shipment_uuid_key" ON "public"."Shipment"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "ShipmentExpense_uuid_key" ON "public"."ShipmentExpense"("uuid");

-- AddForeignKey
ALTER TABLE "public"."Shipment" ADD CONSTRAINT "Shipment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Shipment" ADD CONSTRAINT "Shipment_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "public"."Inventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ShipmentExpense" ADD CONSTRAINT "ShipmentExpense_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "public"."Shipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
