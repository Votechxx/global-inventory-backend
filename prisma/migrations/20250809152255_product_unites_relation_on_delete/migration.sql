-- DropForeignKey
ALTER TABLE "public"."ProductUnit" DROP CONSTRAINT "ProductUnit_productId_fkey";

-- AddForeignKey
ALTER TABLE "public"."ProductUnit" ADD CONSTRAINT "ProductUnit_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
