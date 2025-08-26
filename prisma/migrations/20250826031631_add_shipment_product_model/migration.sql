-- CreateTable
CREATE TABLE "public"."ShipmentProduct" (
    "id" SERIAL NOT NULL,
    "shipmentId" INTEGER NOT NULL,
    "productUnitId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "piecesPerPallet" INTEGER NOT NULL DEFAULT 1,
    "pallets" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unitPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShipmentProduct_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."ShipmentProduct" ADD CONSTRAINT "ShipmentProduct_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "public"."Shipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ShipmentProduct" ADD CONSTRAINT "ShipmentProduct_productUnitId_fkey" FOREIGN KEY ("productUnitId") REFERENCES "public"."ProductUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
