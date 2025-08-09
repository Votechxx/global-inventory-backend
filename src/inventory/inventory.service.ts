import { Injectable, NotFoundException } from '@nestjs/common';
import { Inventory, RoleEnum } from '@prisma/client';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import {
    CreateInventoryDto,
    UpdateInventoryDto,
    AddWorkerToInventoryDto,
    MoveWorkerDto,
    InventoryQueryDto,
} from './dto/inventory.dto';
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

    async getInventories(inventoryQueryDto: InventoryQueryDto, user: any) {
        const {
            page = 1,
            limit = 20,
            name,
            sortOrder = 'desc',
            ...filter
        } = inventoryQueryDto;
        const take = Math.min(limit, 50);
        const skip = (page - 1) * take;

        const where: any = { ...filter };
        if (name) where.name = { contains: name, mode: 'insensitive' };
        if (user.role !== RoleEnum.ADMIN)
            where.workers = { some: { id: user.id } };

        // Fetch inventories with pagination and sorting of workers
        const inventories = await this.prismaService.inventory.findMany({
            where,
            take,
            skip,
            include: {
                workers: { orderBy: { createdAt: sortOrder } }, // sort workers by createdAt
                Product: true,
            },
        });
        const count = await this.prismaService.inventory.count({ where });

        // add workers count to each inventory
        const result = inventories.map((inventory) => ({
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
            include: {
                inventory: { include: { Product: true, workers: true } },
            },
        });
        if (!user?.inventory)
            throw new NotFoundException('No inventory assigned');
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
        if (!inventory)
            throw new NotFoundException('Source inventory not found');

        const targetInventory =
            await this.inventoryRepo.getInventoryById(targetInventoryId);
        if (!targetInventory)
            throw new NotFoundException('Target inventory not found');

        return this.prismaService.user.update({
            where: { id: workerId },
            data: { inventoryId: targetInventoryId },
        });
    }
}
