import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import { Prisma, StatusShipmentEnum } from '@prisma/client';

@Injectable()
export class ShipmentRepo {
    constructor(private readonly prismaService: PrismaService) {}

    async getShipmentById(id: number) {
        const shipment = await this.prismaService.shipment.findUnique({
            where: { id },
            include: {
                user: true,
                inventory: true,
                shipmentExpenses: true,
                shipmentProducts: true,
            },
        });
        if (!shipment) throw new NotFoundException('Shipment not found');
        return shipment;
    }

    async createShipment(
        data: Prisma.ShipmentCreateInput,
        prisma: Prisma.TransactionClient = this.prismaService,
    ) {
        return prisma.shipment.create({
            data,
            include: {
                user: true,
                inventory: true,
                shipmentExpenses: true,
                shipmentProducts: true,
            },
        });
    }

    async getActiveShipmentOfInventory(inventoryId: number) {
        const shipment = await this.prismaService.shipment.findFirst({
            where: {
                inventoryId,
                status: {
                    in: [
                        StatusShipmentEnum.PENDING,
                        StatusShipmentEnum.PENDING_REVIEW,
                    ],
                },
            },
            include: {
                user: true,
                inventory: true,
                shipmentExpenses: true,
                shipmentProducts: true,
            },
        });
        return shipment;
    }

    async updateShipment(
        id: number,
        data: Prisma.ShipmentUpdateInput,
        prisma: Prisma.TransactionClient = this.prismaService,
    ) {
        return prisma.shipment.update({
            where: { id },
            data,
            include: {
                user: true,
                inventory: true,
                shipmentExpenses: true,
                shipmentProducts: true,
            },
        });
    }
}
