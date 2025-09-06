import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';

@Injectable()
export class ProductUnitRepo {
    constructor(private readonly prismaService: PrismaService) {}

    async addMoreUnits(
        value: number,
        productUnitId: number,
        prisma?: Prisma.TransactionClient,
    ) {
        return prisma.productUnit.update({
            where: { id: productUnitId },
            data: {
                value: {
                    increment: value,
                },
            },
        });
    }

    async reduceUnits(
        value: number,
        productUnitId: number,
        prisma?: Prisma.TransactionClient,
    ) {
        return prisma.productUnit.update({
            where: { id: productUnitId },
            data: {
                value: {
                    decrement: value,
                },
            },
        });
    }

    async getProductUnitsByIdsWithDetails(productUnitIds: number[]) {
        return this.prismaService.productUnit.findMany({
            where: {
                id: {
                    in: productUnitIds,
                },
            },
            select: {
                id: true,
                value: true,
                quantity: true,
                product: {
                    select: {
                        id: true,
                        name: true,
                        inventoryId: true,
                        price: true,
                    },
                },
            },
        });
    }

    async getProductUnitsByInventoryId(inventoryId: number) {
        return this.prismaService.productUnit.findMany({
            where: {
                product: {
                    inventoryId,
                },
            },
            select: {
                id: true,
                value: true,
                quantity: true,
                product: {
                    select: {
                        id: true,
                        name: true,
                        inventoryId: true,
                        price: true,
                    },
                },
            },
        });
    }
}
