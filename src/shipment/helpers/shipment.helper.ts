import { Injectable } from '@nestjs/common';
import { ShipmentResponseDto } from '../dto/shipment.dto';
import { Expense } from '@prisma/client';

@Injectable()
export class ShipmentHelper {
  calculateTotalPrice(expenses: Expense[]): number {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }

  mapToResponse(shipment: any, totalPrice: number): ShipmentResponseDto {
    return {
      id: shipment.id,
      uuid: shipment.uuid,
      title: shipment.title,
      numberOfTrucks: shipment.numberOfTrucks,
      status: shipment.status,
      inventoryId: shipment.inventoryId,
      totalPrice,
      createdAt: shipment.createdAt,
      updatedAt: shipment.updatedAt,
    };
  }

  validateShipmentData(createShipmentDto: any): boolean {
    if (!createShipmentDto.title || !createShipmentDto.numberOfTrucks || !createShipmentDto.inventoryId) {
      return false;
    }
    if (createShipmentDto.expenses) {
      return createShipmentDto.expenses.every(exp => exp.name && exp.amount !== undefined);
    }
    return true;
  }
}