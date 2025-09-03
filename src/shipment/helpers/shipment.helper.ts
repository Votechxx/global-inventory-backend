import { Shipment, ShipmentExpense, ShipmentProduct } from '@prisma/client';
import { ShipmentResponseDto } from '../dto/shipment.dto';

export class ShipmentHelper {
    static mapToResponse(
        shipment: Shipment,
        totalPrice: number,
        shipmentProducts: ShipmentProduct[],
        shipmentExpenses: ShipmentExpense[] = [],
    ): ShipmentResponseDto {
        return {
            id: shipment.id,
            uuid: shipment.uuid,
            title: shipment.title,
            numberOfTrucks: shipment.numberOfTrucks || 0,
            status: shipment.status,
            inventoryId: shipment.inventoryId,
            totalPrice: totalPrice,
            clarkInstallmentExpenses: shipment.clarkInstallmentExpenses,
            shipmentCardExpenses: shipment.shipmentCardExpenses,
            otherExpenses: shipment.otherExpenses,
            carCount: shipment.carCount,
            shipmentProducts: shipmentProducts.map((p) => ({
                productUnitId: p.productUnitId,
                quantity: p.quantity,
                piecesPerPallet: p.piecesPerPallet,
                unitPrice: p.unitPrice,
            })),
            createdAt: shipment.createdAt,
            updatedAt: shipment.updatedAt,
            shipmentExpenses: shipmentExpenses,
        };
    }
}
