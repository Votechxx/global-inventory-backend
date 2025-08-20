import { ShipmentResponseDto } from '../dto/shipment.dto';
import { ExpenseTag, Shipment } from '@prisma/client';

export class ShipmentHelper {
    static mapToResponse(
        shipment: Shipment & {
            shipmentExpenses?: {
                name: string;
                amount: number;
                description?: string;
                tag?: ExpenseTag;
            }[];
        },
        totalPrice: number,
    ): ShipmentResponseDto {
        return {
            id: shipment.id,
            uuid: shipment.uuid,
            title: shipment.title,
            numberOfTrucks: shipment.numberOfTrucks,
            status: shipment.status,
            inventoryId: shipment.inventoryId,
            isWaitingForChanges: shipment.isWaitingForChanges,
            totalPrice: totalPrice,
            createdAt: shipment.createdAt,
            updatedAt: shipment.updatedAt,
            shipmentExpenses: (shipment.shipmentExpenses ?? []).map(
                (expense) => ({
                    name: expense.name,
                    amount: expense.amount,
                    description: expense.description,
                    tag: expense.tag,
                }),
            ),
        };
    }
}
