import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ShipmentRepo {
  constructor(private readonly prismaService: PrismaService) {}

  async getShipmentById(id: number) {
    const shipment = await this.prismaService.shipment.findUnique({
      where: { id },
      include: { user: true, inventory: true, shipmentExpenses: true },
    });
    if (!shipment) throw new NotFoundException('Shipment not found');
    return shipment;
  }

  async createShipment(data: Prisma.ShipmentCreateInput) {
    return this.prismaService.shipment.create({
      data,
      include: { user: true, inventory: true, shipmentExpenses: true },
    });
  }

  async updateShipment(id: number, data: Prisma.ShipmentUpdateInput) {
    return this.prismaService.shipment.update({
      where: { id },
      data,
      include: { user: true, inventory: true, shipmentExpenses: true },
    });
  }
}