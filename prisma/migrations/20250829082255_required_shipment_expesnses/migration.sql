-- AlterTable
ALTER TABLE "public"."Shipment" ADD COLUMN     "clarkInstallmentExpenses" DOUBLE PRECISION,
ADD COLUMN     "otherExpenses" DOUBLE PRECISION,
ADD COLUMN     "reasonMessage" TEXT,
ADD COLUMN     "shipmentCardExpenses" DOUBLE PRECISION;
