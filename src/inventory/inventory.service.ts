import { Injectable, NotFoundException } from '@nestjs/common';
import { Inventory, RoleEnum } from '@prisma/client';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import { CreateInventoryDto, UpdateInventoryDto, AddWorkerToInventoryDto, MoveWorkerDto, InventoryQueryDto } from './dto/inventory.dto';
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
        const data: any = {
            name: createInventoryDto.name,
            description: createInventoryDto.description,
            location: createInventoryDto.location,
            balance: createInventoryDto.balance || 0, 
        };
        return this.inventoryRepo.createInventory(data);
    }

    async updateInventory(id: number, updateInventoryDto: UpdateInventoryDto) {
        const data: any = {
            name: updateInventoryDto.name,
            description: updateInventoryDto.description,
            location: updateInventoryDto.location,
            balance: updateInventoryDto.balance,
        };
        return this.inventoryRepo.updateInventory(id, data);
    }

    async deleteInventory(id: number) {
        return this.inventoryRepo.deleteInventory(id);
    }

    async getInventories(inventoryQueryDto: InventoryQueryDto, user: any) {
        const { page = 1, limit = 20, name, sortOrder = 'desc', ...filter } = inventoryQueryDto;
        const take = Math.min(limit, 50);
        const skip = (page - 1) * take;

        const where: any = { ...filter };
        if (name) where.name = { contains: name, mode: 'insensitive' };
        if (user.role !== RoleEnum.ADMIN) where.workers = { some: { id: user.id } };

        const inventories = await this.prismaService.inventory.findMany({
            where,
            take,
            skip,
            include: {
                workers: { orderBy: { createdAt: sortOrder } },
                products: true,
            },
        });
        const count = await this.prismaService.inventory.count({ where });

        const result = inventories.map(inventory => ({
            ...inventory,
            workerCount: inventory.workers.length,
        }));

        return {
            totalDocs: count,
            count: result.length,
            inventories: result,
        };
    }

    async getInventoryByUserId(userId: number) {
        const user = await this.prismaService.user.findUnique({
            where: { id: userId },
            include: { inventory: { include: { products: true, workers: true } } },
        });
        if (!user?.inventory) throw new NotFoundException('No inventory assigned');
        return {
            ...user.inventory,
            workerCount: user.inventory.workers.length,
        };
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