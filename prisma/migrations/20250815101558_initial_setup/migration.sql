-- CreateEnum
CREATE TYPE "public"."ExpenseTag" AS ENUM ('GAS', 'ELECTRICITY', 'WATER', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."FileTypeEnum" AS ENUM ('IMAGE', 'VIDEO', 'DOCUMENT');

-- CreateEnum
CREATE TYPE "public"."FileSourceEnum" AS ENUM ('LOCAL', 'S3', 'CLOUDINARY');

-- CreateEnum
CREATE TYPE "public"."GenderEnum" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "public"."RoleEnum" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "public"."UserCreationMethodEnum" AS ENUM ('EMAIL', 'GOOGLE', 'APPLE', 'MANUAL');

-- CreateEnum
CREATE TYPE "public"."StatusReportEnum" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."TransactionTypeEnum" AS ENUM ('ADD', 'REMOVE', 'TRANSFER');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "shopId" INTEGER,
    "phoneNumber" TEXT,
    "username" TEXT,
    "parentPhone" TEXT,
    "password" TEXT,
    "role" "public"."RoleEnum" NOT NULL DEFAULT 'USER',
    "profileImageId" INTEGER,
    "inventoryId" INTEGER,
    "dob" TIMESTAMP(3),
    "gender" "public"."GenderEnum",
    "nationality" TEXT,
    "address" TEXT,
    "zipCode" TEXT,
    "city" TEXT,
    "country" TEXT,
    "dateToExpireOtp" TIMESTAMP(3),
    "qrCode" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "otp" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "googleId" TEXT,
    "appleId" TEXT,
    "userCreationMethod" "public"."UserCreationMethodEnum" NOT NULL DEFAULT 'EMAIL',
    "verificationEmailedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Product" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "inventoryId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductUnit" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "batch" INTEGER NOT NULL DEFAULT 0,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "productId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Inventory" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "currentBalance" DOUBLE PRECISION DEFAULT 0,
    "totalBalance" DOUBLE PRECISION DEFAULT 0,
    "cashOnHand" DOUBLE PRECISION DEFAULT 0,
    "bankDeposit" DOUBLE PRECISION DEFAULT 0,
    "totalExpenses" DOUBLE PRECISION DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);

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
    "rejectionReason" TEXT,
    "depositReceiptId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Expense" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "tag" "public"."ExpenseTag" NOT NULL,
    "inventoryId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."File" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "source" "public"."FileSourceEnum" NOT NULL DEFAULT 'LOCAL',
    "type" "public"."FileTypeEnum" NOT NULL,
    "size" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_InventoryDepositReceipts" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_InventoryDepositReceipts_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_uuid_key" ON "public"."User"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "public"."User"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_profileImageId_key" ON "public"."User"("profileImageId");

-- CreateIndex
CREATE UNIQUE INDEX "User_qrCode_key" ON "public"."User"("qrCode");

-- CreateIndex
CREATE UNIQUE INDEX "Product_uuid_key" ON "public"."Product"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Product_name_key" ON "public"."Product"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ProductUnit_uuid_key" ON "public"."ProductUnit"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_uuid_key" ON "public"."Inventory"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Report_uuid_key" ON "public"."Report"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Report_depositReceiptId_key" ON "public"."Report"("depositReceiptId");

-- CreateIndex
CREATE UNIQUE INDEX "Expense_uuid_key" ON "public"."Expense"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "File_uuid_key" ON "public"."File"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "File_path_key" ON "public"."File"("path");

-- CreateIndex
CREATE INDEX "_InventoryDepositReceipts_B_index" ON "public"."_InventoryDepositReceipts"("B");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "public"."Inventory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_profileImageId_fkey" FOREIGN KEY ("profileImageId") REFERENCES "public"."File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "public"."Inventory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductUnit" ADD CONSTRAINT "ProductUnit_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Report" ADD CONSTRAINT "Report_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "public"."Inventory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Report" ADD CONSTRAINT "Report_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Report" ADD CONSTRAINT "Report_depositReceiptId_fkey" FOREIGN KEY ("depositReceiptId") REFERENCES "public"."File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Expense" ADD CONSTRAINT "Expense_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Expense" ADD CONSTRAINT "Expense_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "public"."Inventory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_InventoryDepositReceipts" ADD CONSTRAINT "_InventoryDepositReceipts_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_InventoryDepositReceipts" ADD CONSTRAINT "_InventoryDepositReceipts_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Inventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
