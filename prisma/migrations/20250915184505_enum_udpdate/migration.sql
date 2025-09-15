/*
  Warnings:

  - The values [PENDING,PENDING_REVIEW,PENDING_DEPOSIT_REVIEW] on the enum `ReportStatusEnum` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."ReportStatusEnum_new" AS ENUM ('IN_REVIEW', 'REQUESTED_CHANGES', 'PENDING_DEPOSIT', 'IN_PENDING_DEPOSIT_REVIEW', 'ACCEPTED');
ALTER TABLE "public"."Report" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."Report" ALTER COLUMN "status" TYPE "public"."ReportStatusEnum_new" USING ("status"::text::"public"."ReportStatusEnum_new");
ALTER TYPE "public"."ReportStatusEnum" RENAME TO "ReportStatusEnum_old";
ALTER TYPE "public"."ReportStatusEnum_new" RENAME TO "ReportStatusEnum";
DROP TYPE "public"."ReportStatusEnum_old";
ALTER TABLE "public"."Report" ALTER COLUMN "status" SET DEFAULT 'IN_REVIEW';
COMMIT;

-- AlterTable
ALTER TABLE "public"."Expense" ADD COLUMN     "applied" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."Report" ALTER COLUMN "status" SET DEFAULT 'IN_REVIEW';
