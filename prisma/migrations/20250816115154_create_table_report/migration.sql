-- CreateEnum
CREATE TYPE "public"."StatusReportEnum" AS ENUM ('PENDING', 'PENDING_DEPOSIT', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "public"."Inventory" ADD COLUMN     "bankDeposit" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "cashOnHand" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "currentBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "totalBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "totalExpenses" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "public"."Report" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "inventoryId" INTEGER NOT NULL,
    "workerId" INTEGER NOT NULL,
    "stock" JSONB NOT NULL,
    "cashOnHand" DOUBLE PRECISION NOT NULL,
    "bankDeposit" DOUBLE PRECISION NOT NULL,
    "status" "public"."StatusReportEnum" NOT NULL DEFAULT 'PENDING',
    "isRequestedChanges" BOOLEAN NOT NULL DEFAULT false,
    "reason" TEXT,
    "depositReceiptFileId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Report_uuid_key" ON "public"."Report"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Report_depositReceiptFileId_key" ON "public"."Report"("depositReceiptFileId");

-- AddForeignKey
ALTER TABLE "public"."Report" ADD CONSTRAINT "Report_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "public"."Inventory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Report" ADD CONSTRAINT "Report_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Report" ADD CONSTRAINT "Report_depositReceiptFileId_fkey" FOREIGN KEY ("depositReceiptFileId") REFERENCES "public"."File"("id") ON DELETE SET NULL ON UPDATE CASCADE;
