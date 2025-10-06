import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';

@Injectable()
export class InventoryRepo {
    constructor(private readonly prismaService: PrismaService) {}

    async getTotalCurrentBalance(inventoryId?: number) {
        const result = await this.prismaService.inventory.aggregate({
            _sum: {
                currentBalance: true,
            },
            where: inventoryId ? { id: inventoryId } : {},
        });
        return result._sum.currentBalance || 0;
    }

    async getInventoryById(id: number) {
        const inventory = await this.prismaService.inventory.findUnique({
            where: { id },
        });
        if (!inventory) throw new NotFoundException('Inventory not found');
        return inventory;
    }

    async getInventoryByName(name: string) {
        return this.prismaService.inventory.findFirst({ where: { name } });
    }

    async createInventory(data: Prisma.InventoryCreateInput) {
        const existingInventory = await this.getInventoryByName(data.name);
        if (existingInventory)
            throw new BadRequestException('Inventory name already exists');
        return this.prismaService.inventory.create({ data });
    }

    async updateInventory(id: number, data: Prisma.InventoryUpdateInput) {
        return this.prismaService.inventory.update({ where: { id }, data });
    }

    async deleteInventory(id: number) {
        return this.prismaService.inventory.delete({ where: { id } });
    }

    async getInventories(
        where: Prisma.InventoryWhereInput,
        take: number,
        skip: number,
    ) {
        return this.prismaService.inventory.findMany({
            where,
            take,
            skip,
            include: {
                workers: { orderBy: { createdAt: 'desc' } },
                Product: true,
            },
        });
    }

    async getInventoryCount(where: Prisma.InventoryWhereInput) {
        return this.prismaService.inventory.count({ where });
    }

    async incrementInventoryBalance(
        id: number,
        amount: number,
        prisma: Prisma.TransactionClient,
    ) {
        return prisma.inventory.update({
            where: { id },
            data: {
                currentBalance: {
                    increment: amount,
                },
                totalBalance: {
                    increment: amount,
                },
            },
        });
    }

    async decrementInventoryBalance(
        id: number,
        amount: number,
        prisma: Prisma.TransactionClient,
    ) {
        return prisma.inventory.update({
            where: { id },
            data: {
                currentBalance: {
                    decrement: amount,
                },
                totalBalance: {
                    decrement: amount,
                },
            },
        });
    }

    async incrementInventoryCurrentBalance(
        id: number,
        amount: number,
        prisma: Prisma.TransactionClient,
    ) {
        return prisma.inventory.update({
            where: { id },
            data: {
                currentBalance: {
                    increment: amount,
                },
            },
        });
    }

    async decrementInventoryCurrentBalance(
        id: number,
        amount: number,
        prisma: Prisma.TransactionClient,
    ) {
        return prisma.inventory.update({
            where: { id },
            data: {
                currentBalance: {
                    decrement: amount,
                },
            },
        });
    }
}
