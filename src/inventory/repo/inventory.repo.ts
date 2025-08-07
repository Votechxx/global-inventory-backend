import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, RoleEnum } from '@prisma/client';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';

@Injectable()
export class InventoryRepo {
    constructor(private readonly prismaService: PrismaService) {}

    async getInventoryById(id: number) {
        const inventory = await this.prismaService.inventory.findUnique({ where: { id } });
        if (!inventory) throw new NotFoundException('Inventory not found');
        return inventory;
    }

    async getInventoryByName(name: string) {
        return this.prismaService.inventory.findFirst({ where: { name } });
    }

    async createInventory(data: Prisma.InventoryCreateInput) {
        const existingInventory = await this.getInventoryByName(data.name);
        if (existingInventory) throw new BadRequestException('Inventory name already exists');
        return this.prismaService.inventory.create({ data });
    }

    async updateInventory(id: number, data: Prisma.InventoryUpdateInput) {
        const inventory = await this.getInventoryById(id);
        return this.prismaService.inventory.update({ where: { id }, data });
    }

    async deleteInventory(id: number) {
        const inventory = await this.getInventoryById(id);
        return this.prismaService.inventory.delete({ where: { id } });
    }

    async getInventories(where: Prisma.InventoryWhereInput, take: number, skip: number) {
        return this.prismaService.inventory.findMany({
            where,
            take,
            skip,
            include: { workers: { orderBy: { createdAt: 'desc' } },products: true },
            
        });
    }

    async getInventoryCount(where: Prisma.InventoryWhereInput) {
        return this.prismaService.inventory.count({ where });
    }
}