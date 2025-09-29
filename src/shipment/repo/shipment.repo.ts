import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import { Prisma, StatusShipmentEnum } from '@prisma/client';
import { ShipmentQueryChartDto } from '../dto/shipment.dto';

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

    async getShipmentsChartStatistics(query: ShipmentQueryChartDto) {
        const { inventoryId, duration } = query;

        let format: 'day' | 'week' | 'month' | 'year';
        const startDate = new Date();
        const endDate = new Date();

        switch (duration) {
            case 'DAILY':
                startDate.setDate(startDate.getDate() - 7);
                format = 'day';
                break;
            case 'WEEKLY':
                startDate.setDate(startDate.getDate() - 30);
                format = 'week';
                break;
            case 'MONTHLY':
                startDate.setMonth(startDate.getMonth() - 12);
                format = 'month';
                break;
            case 'YEARLY':
                startDate.setFullYear(startDate.getFullYear() - 5);
                format = 'year';
                break;
            default:
                format = 'month';
                startDate.setDate(startDate.getDate() - 7);
        }

        const inventoryFilter = inventoryId
            ? Prisma.sql`AND s."inventoryId" = ${inventoryId}`
            : Prisma.empty;

        const shipments = await this.prismaService.$queryRaw<
            { period: Date; count: number }[]
        >(Prisma.sql`
            WITH periods AS (
            SELECT generate_series(
                DATE_TRUNC(${format}::text, ${startDate}::timestamp),
                DATE_TRUNC(${format}::text, ${endDate}::timestamp),
                ('1 ' || ${format})::interval
            ) AS period
            )
            SELECT p.period,
                COALESCE(COUNT(s.id), 0)::int AS count
            FROM periods p
            LEFT JOIN "Shipment" s
            ON DATE_TRUNC(${format}::text, s."createdAt") = p.period
            AND s."createdAt" BETWEEN ${startDate} AND ${endDate}
            ${inventoryFilter}
            GROUP BY p.period
            ORDER BY p.period ASC
        `);

        return {
            shipments: shipments.map((s) => ({
                period: s.period,
                count: s.count,
            })),
            total: shipments.reduce((acc, curr) => acc + curr.count, 0),
        };
    }
}
