import { Injectable, NotFoundException } from '@nestjs/common';
import { Inventory, RoleEnum, StatusReportEnum, FileTypeEnum } from '@prisma/client';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import {
    CreateInventoryDto,
    UpdateInventoryDto,
    AddWorkerToInventoryDto,
    InventoryQueryDto,
    SubmitDailyReportDto,
    ReviewDailyReportDto,
    UpdateProductQuantityDto,
} from './dto/inventory.dto';
import { InventoryRepo } from './repo/inventory.repo';
import { InventoryHelper } from './helpers/inventory.helper';
import { LocalService } from '../file/local/local.service';
import { BadRequestException } from '@nestjs/common';
import { UploadLocalFileDto } from '../file/local/dto/local.dto'
import { FileCategoryEnum } from 'src/file/enum/file-category.enum';

@Injectable()
export class InventoryService {
    constructor(
        private prismaService: PrismaService,
        private readonly inventoryRepo: InventoryRepo,
        private readonly inventoryHelper: InventoryHelper,
        private readonly localService: LocalService,
    ) {}

    // Dashboard Functions
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

        const inventories = await this.prismaService.inventory.findMany({
            where,
            take,
            skip,
            include: {
                workers: { orderBy: { createdAt: sortOrder } },
                Product: true,
            },
        });
        const count = await this.prismaService.inventory.count({ where });

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

    // Inventory Management Functions (New)
    async initializeInventoryStock(inventoryId: number, products: { productId: number; quantity: number }[], cashOnHand: number) {
        const inventory = await this.inventoryRepo.getInventoryById(inventoryId);
        if (!inventory) throw new NotFoundException('Inventory not found');

        const initialValue = await this.inventoryHelper.calculateTotalValue(products, this.prismaService);
        const data: any = {
            cashOnHand: cashOnHand,
            currentBalance: cashOnHand + initialValue,
            totalBalance: cashOnHand + initialValue,
        };

        return this.prismaService.$transaction(async (prisma) => {
            for (const product of products) {
                const productUnit = await prisma.productUnit.findFirst({ where: { productId: product.productId } });
                if (productUnit) {
                    await prisma.productUnit.update({
                        where: { id: productUnit.id },
                        data: {
                            quantity: product.quantity,
                            batch: Math.floor(product.quantity / 10),
                        },
                    });
                } else {
                    const dbProduct = await prisma.product.findUnique({ where: { id: product.productId } });
                    if (!dbProduct) throw new NotFoundException('Product not found');
                    await prisma.productUnit.create({
                        data: {
                            productId: product.productId,
                            quantity: product.quantity,
                            batch: Math.floor(product.quantity / 10),
                        },
                    });
                }
            }

            return this.inventoryRepo.updateInventory(inventoryId, data);
        });
    }

    async updateInventoryStock(inventoryId: number, products: { productId: number; quantity: number }[], cashOnHand: number, depositAmount?: number, fileId?: number) {
        const inventory = await this.inventoryRepo.getInventoryById(inventoryId);
        if (!inventory) throw new NotFoundException('Inventory not found');

        let newValue = 0;
        if (products) {
            newValue = await this.inventoryHelper.calculateTotalValue(products, this.prismaService);
        }

        const data: any = {
            cashOnHand: cashOnHand ?? inventory.cashOnHand,
        };

        if (depositAmount && fileId) {
            const file = await this.prismaService.file.findUnique({ where: { id: fileId } });
            if (!file) throw new NotFoundException('File not found');
            if (file.type !== FileTypeEnum.IMAGE && file.type !== FileTypeEnum.DOCUMENT) {
                throw new BadRequestException('Deposit receipt must be an image or PDF');
            }

            data.currentBalance = (inventory.currentBalance ?? 0) + depositAmount;
            data.totalBalance = (inventory.totalBalance ?? 0) + depositAmount;
            data.depositReceipts = { connect: { id: fileId } };
        } else {
            data.currentBalance = (cashOnHand ?? inventory.cashOnHand) + newValue;
            data.totalBalance = (inventory.totalBalance ?? 0) + newValue;
        }

        return this.prismaService.$transaction(async (prisma) => {
            if (products) {
                for (const product of products) {
                    const productUnit = await prisma.productUnit.findFirst({ where: { productId: product.productId } });
                    if (productUnit) {
                        await prisma.productUnit.update({
                            where: { id: productUnit.id },
                            data: {
                                quantity: product.quantity,
                                batch: Math.floor(product.quantity / 10),
                            },
                        });
                    } else {
                        const dbProduct = await prisma.product.findUnique({ where: { id: product.productId } });
                        if (!dbProduct) throw new NotFoundException('Product not found');
                        await prisma.productUnit.create({
                            data: {
                                productId: product.productId,
                                quantity: product.quantity,
                                batch: Math.floor(product.quantity / 10),
                            },
                        });
                    }
                }
            }

            return this.inventoryRepo.updateInventory(inventoryId, data);
        });
    }

    // Report Functions
    async submitDailyReport(inventoryId: number, workerId: number, submitDailyReportDto: SubmitDailyReportDto, file?: Express.Multer.File) {
        const inventory = await this.inventoryRepo.getInventoryById(inventoryId);
        if (!inventory) throw new NotFoundException('Inventory not found');

        let fileId: number | undefined;
        if (file) {
            const uploadDto: UploadLocalFileDto = {
                category: FileCategoryEnum.REPORTS,
                file: file,
            };
            fileId = await this.localService.uploadLocalFile(uploadDto);
        }

        const existingReport = await this.prismaService.report.findFirst({
            where: { inventoryId, createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }, status: StatusReportEnum.PENDING },
        });
        if (existingReport) throw new BadRequestException('Pending report already exists');

        const stockJson = submitDailyReportDto.stock.map(item => ({
            productId: item.productId,
            stock: item.stock,
        }));

        return this.prismaService.report.create({
            data: {
                inventory: { connect: { id: inventoryId } },
                worker: { connect: { id: workerId } },
                stock: stockJson as any, // Cast to any لأن Prisma بيحتاج Json
                cashOnHand: submitDailyReportDto.cashOnHand,
                bankDeposit: submitDailyReportDto.bankDeposit,
                ...(fileId && { depositReceipt: { connect: { id: fileId } } }),
            },
        });
    }

    async reviewDailyReport(reportId: number, reviewDailyReportDto: ReviewDailyReportDto) {
        const report = await this.prismaService.report.findUnique({ where: { id: reportId }, include: { inventory: true } });
        if (!report) throw new NotFoundException('Report not found');

        if (reviewDailyReportDto.status === StatusReportEnum.APPROVED) {
            let revenue = 0;
            let totalSold = 0;
            let totalInitialStock = 0;
            if (report.stock && Array.isArray(report.stock)) {
                for (const item of report.stock as { productId: number; stock: number }[]) {
                    const productUnit = await this.prismaService.productUnit.findFirst({ where: { productId: item.productId } });
                    if (productUnit) {
                        totalInitialStock += productUnit.quantity;
                        totalSold += (productUnit.quantity - item.stock);
                        revenue += (productUnit.quantity - item.stock) * (await this.prismaService.product.findUnique({ where: { id: item.productId } }))?.price || 0;
                    }
                }
            }
            const breakageRate = totalSold > 0 ? (totalSold / totalInitialStock) * 100 : 0;
            const lostValue = report.cashOnHand < (revenue - report.bankDeposit) ? (revenue - report.bankDeposit - report.cashOnHand) : 0;
            const finalCurrentBalance = report.inventory.currentBalance + revenue - lostValue - report.bankDeposit;
            const finalTotalBalance = report.inventory.totalBalance + revenue;

            if (breakageRate > 1.5) {
                console.log(`Warning: Breakage rate (${breakageRate}%) exceeds 1.5%. Requesting review. Message: Please review the report ${reportId} due to high breakage rate.`);
            }

            await this.prismaService.inventory.update({
                where: { id: report.inventoryId },
                data: {
                    currentBalance: finalCurrentBalance,
                    totalBalance: finalTotalBalance,
                },
            });

            if (report.stock && Array.isArray(report.stock)) {
                for (const item of report.stock as { productId: number; stock: number }[]) {
                    const productUnit = await this.prismaService.productUnit.findFirst({ where: { productId: item.productId } });
                    if (productUnit) {
                        await this.prismaService.productUnit.update({
                            where: { id: productUnit.id },
                            data: { quantity: item.stock },
                        });
                    }
                }
            }
        }

        return this.prismaService.report.update({
            where: { id: reportId },
            data: { status: reviewDailyReportDto.status, rejectionReason: reviewDailyReportDto.rejectionReason },
        });
    }

    // Inventory Review Function (New)
    async reviewInventory(inventoryId: number, reviewMessage: string) {
        const inventory = await this.inventoryRepo.getInventoryById(inventoryId);
        if (!inventory) throw new NotFoundException('Inventory not found');

        // Logic for inventory review (e.g., check stock consistency or cash balance)
        const products = await this.prismaService.productUnit.findMany({
            where: {
                product: {
                    inventoryId: inventoryId
                }
            }
        });
        let totalStockValue = 0;
        for (const product of products) {
            const dbProduct = await this.prismaService.product.findUnique({ where: { id: product.productId } });
            if (dbProduct) {
                totalStockValue += dbProduct.price * product.quantity;
            }
        }

        const expectedBalance = inventory.cashOnHand + totalStockValue;
        if (Math.abs(inventory.currentBalance - expectedBalance) > 10) { // Tolerance of 10 units
            console.log(`Inventory ${inventoryId} review message: ${reviewMessage}. Discrepancy detected: Expected ${expectedBalance}, Actual ${inventory.currentBalance}`);
        } else {
            console.log(`Inventory ${inventoryId} reviewed: ${reviewMessage}. Balance is consistent.`);
        }

        // No update to database, just logging for now
        return { message: 'Inventory reviewed', inventoryId, expectedBalance, currentBalance: inventory.currentBalance };
    }

}