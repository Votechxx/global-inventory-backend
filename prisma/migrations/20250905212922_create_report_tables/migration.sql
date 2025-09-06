-- CreateEnum
CREATE TYPE "public"."ReportStatusEnum" AS ENUM ('PENDING', 'PENDING_REVIEW', 'PENDING_DEPOSIT', 'PENDING_DEPOSIT_REVIEW', 'ACCEPTED');

-- DropEnum
DROP TYPE "public"."StatusDailyReportEnum";

-- CreateTable
CREATE TABLE "public"."Report" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "title" TEXT,
    "expectedSelledMoneyAmount" DOUBLE PRECISION NOT NULL,
    "totalExpensesMoneyAmount" DOUBLE PRECISION NOT NULL,
    "netMoneyAmount" DOUBLE PRECISION NOT NULL,
    "currentMoneyAmount" DOUBLE PRECISION NOT NULL,
    "realNetMoneyAmount" DOUBLE PRECISION NOT NULL,
    "brokenRate" DOUBLE PRECISION NOT NULL,
    "depositMoneyAmount" DOUBLE PRECISION,
    "depositImageId" INTEGER,
    "status" "public"."ReportStatusEnum" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ReportProduct" (
    "id" SERIAL NOT NULL,
    "reportId" INTEGER NOT NULL,
    "productUnitId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "piecesPerPallet" INTEGER NOT NULL,
    "pallets" DOUBLE PRECISION NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Report_uuid_key" ON "public"."Report"("uuid");

-- AddForeignKey
ALTER TABLE "public"."Report" ADD CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Report" ADD CONSTRAINT "Report_depositImageId_fkey" FOREIGN KEY ("depositImageId") REFERENCES "public"."File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReportProduct" ADD CONSTRAINT "ReportProduct_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "public"."Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReportProduct" ADD CONSTRAINT "ReportProduct_productUnitId_fkey" FOREIGN KEY ("productUnitId") REFERENCES "public"."ProductUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
