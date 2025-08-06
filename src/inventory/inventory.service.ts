import { Injectable, NotFoundException } from '@nestjs/common';
import { Inventory, RoleEnum } from '@prisma/client';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import { CreateInventoryDto, UpdateInventoryDto, AddWorkerToInventoryDto, MoveWorkerDto } from './dto/inventory.dto';
import { InventoryRepo } from './repo/inventory.repo';
import { InventoryHelper } from './helpers/inventory.helper';

@Injectable()
export class InventoryService {
    constructor(
        private prismaService: PrismaService,
        private readonly inventoryRepo: InventoryRepo,
        private readonly inventoryHelper: InventoryHelper,
    ) {}

    async createInventory(createInventoryDto: CreateInventoryDto) {
        return this.inventoryRepo.createInventory(createInventoryDto);
    }

    async updateInventory(id: number, updateInventoryDto: UpdateInventoryDto) {
        return this.inventoryRepo.updateInventory(id, updateInventoryDto);
    }

    async deleteInventory(id: number) {
        return this.inventoryRepo.deleteInventory(id);
    }

    async getInventories(inventoryQueryDto: any, user: any) {
        const { page = 1, limit = 20, name, ...filter } = inventoryQueryDto;
        const take = Math.min(limit, 50);
        const skip = (page - 1) * take;

        const where: any = { ...filter };
        if (name) where.name = { contains: name, mode: 'insensitive' };
        if (user.role !== RoleEnum.ADMIN) where.workers = { some: { id: user.id } };

        const inventories = await this.inventoryRepo.getInventories(where, take, skip);
        const count = await this.inventoryRepo.getInventoryCount(where);

        return {
            totalDocs: count,
            count: inventories.length,
            inventories,
        };
    }

    async getInventoryByUserId(userId: number) {
        const user = await this.prismaService.user.findUnique({
            where: { id: userId },
            include: { inventory: { include: { products: true, workers: true } } },
        });
        if (!user?.inventory) throw new NotFoundException('No inventory assigned');
        return user.inventory;
    }

    async addWorkerToInventory(id: number, workerId: number) {
        const inventory = await this.inventoryRepo.getInventoryById(id);
        if (!inventory) throw new NotFoundException('Inventory not found');

        return this.prismaService.user.update({
            where: { id: workerId },
            data: { inventoryId: id },
        });
    }

    async moveWorker(id: number, workerId: number, targetInventoryId: number) {
        const inventory = await this.inventoryRepo.getInventoryById(id);
        if (!inventory) throw new NotFoundException('Source inventory not found');

        const targetInventory = await this.inventoryRepo.getInventoryById(targetInventoryId);
        if (!targetInventory) throw new NotFoundException('Target inventory not found');

        return this.prismaService.user.update({
            where: { id: workerId },
            data: { inventoryId: targetInventoryId },
        });
    }
}