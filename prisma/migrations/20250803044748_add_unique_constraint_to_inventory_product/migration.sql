/*
  Warnings:

  - A unique constraint covering the columns `[inventoryId,productId]` on the table `InventoryProduct` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Inventory" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "InventoryProduct_inventoryId_productId_key" ON "public"."InventoryProduct"("inventoryId", "productId");
