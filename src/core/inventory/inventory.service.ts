import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Inventory, Prisma, RoleEnum } from '@prisma/client';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import { AddProductDto } from './dto/add-product.dto';
import { AddWorkerDto } from './dto/add-worker.dto';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { InventoryQueryDto } from './dto/inventory-query.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
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
        const inventory = await this.inventoryRepo.getInventoryById(id);
        if (!inventory) throw new NotFoundException('Inventory not found');
        const { name, initialBalance, location, description } =
            updateInventoryDto;
        return await this.prismaService.inventory.update({
            where: { id },
            data: {
                name,
                balance: initialBalance,
                location: location,
                description: description,
            },
        });
    }

    async deleteInventory(id: number) {
        const inventory = await this.inventoryRepo.getInventoryById(id);
        if (!inventory) throw new NotFoundException('Inventory not found');

        // استخدام الحذف الفعلي بدلاً من soft delete
        return this.prismaService.inventory.delete({
            where: { id },
        });
    }

    async getInventories(inventoryQueryDto: InventoryQueryDto, user: any) {
        const {
            page = 1,
            limit = 20,
            name,
            minBalance,
            maxBalance,
            ...filter
        } = inventoryQueryDto;
        const take = Math.min(limit, 50);
        const skip = (page - 1) * take;

        const where: Prisma.InventoryWhereInput = {
            ...filter,
        };
        if (name) {
            where.name = { contains: name, mode: 'insensitive' };
        }
        if (minBalance || maxBalance) {
            where.balance = {};
            if (minBalance) where.balance.gte = minBalance;
            if (maxBalance) where.balance.lte = maxBalance;
        }
        if (user.role !== RoleEnum.ADMIN) {
            where.workers = { some: { id: user.id } };
        }

        const inventories = await this.prismaService.inventory.findMany({
            where,
            take,
            skip,
            include: {
                workers: true,
                products: { include: { product: true } },
            },
        });
        const count = await this.prismaService.inventory.count({ where });

        return {
            totalDocs: count,
            count: inventories.length,
            inventories,
        };
    }

    async getInventoryByUserId(userId: number) {
        const user = await this.prismaService.user.findUnique({
            where: { id: userId },
            include: {
                inventory: {
                    include: {
                        products: { include: { product: true } },
                        workers: true,
                    },
                },
            },
        });
        if (!user?.inventory)
            throw new NotFoundException('No inventory assigned');
        return user.inventory;
    }

    async addProductToInventory(
        id: number,
        addProductDto: AddProductDto,
        adminId: number,
    ) {
        const admin = await this.prismaService.user.findUnique({
            where: { id: adminId, role: RoleEnum.ADMIN },
        });
        if (!admin)
            throw new ForbiddenException('Only admins can add products');

        const inventory = await this.inventoryRepo.getInventoryById(id);
        if (!inventory) throw new NotFoundException('Inventory not found');

        return this.prismaService.$transaction(async (prisma) => {
            return prisma.inventoryProduct.upsert({
                where: {
                    inventoryId_productId: {
                        inventoryId: id,
                        productId: addProductDto.productId,
                    },
                },
                update: { quantity: { increment: addProductDto.quantity } },
                create: {
                    inventoryId: id,
                    productId: addProductDto.productId,
                    quantity: addProductDto.quantity,
                },
            });
        });
    }

    async addWorkerToInventory(
        id: number,
        addWorkerDto: AddWorkerDto,
        adminId: number,
    ) {
        const admin = await this.prismaService.user.findUnique({
            where: { id: adminId, role: RoleEnum.ADMIN },
        });
        if (!admin) throw new ForbiddenException('Only admins can add workers');

        const inventory = await this.inventoryRepo.getInventoryById(id);
        if (!inventory) throw new NotFoundException('Inventory not found');

        const worker = await this.prismaService.user.findUnique({
            where: { id: addWorkerDto.workerId, role: RoleEnum.USER },
        });
        if (!worker) throw new ForbiddenException('Invalid worker');

        return this.prismaService.user.update({
            where: { id: addWorkerDto.workerId },
            data: { inventoryId: id },
        });
    }
}
