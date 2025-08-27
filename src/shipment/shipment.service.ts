import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import { CreateShipmentDto, ShipmentResponseDto, UpdateShipmentDto } from './dto/shipment.dto';
import { Prisma, User } from '@prisma/client';
import { ShipmentRepo } from './repo/shipment.repo';
import { ShipmentHelper } from './helpers/shipment.helper';
import { StatusShipmentEnum, ExpenseTag } from '@prisma/client';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class ShipmentService {
    constructor(
        private prismaService: PrismaService,
        private readonly shipmentRepo: ShipmentRepo,
        private readonly shipmentHelper: ShipmentHelper,
        private readonly inventoryService: InventoryService,
    ) {}

    async createShipment(inventoryId: number, createShipmentDto: CreateShipmentDto, user: User): Promise<ShipmentResponseDto> {
        const inventory = await this.prismaService.inventory.findUnique({ where: { id: inventoryId } });
        if (!inventory) throw new NotFoundException('Inventory not found');

        const existingShipment = await this.shipmentRepo.getActiveShipmentOfInventory(inventoryId);
        if (existingShipment) {
            throw new BadRequestException('There is already an active shipment for this inventory');
        }

        const shipmentData: Prisma.ShipmentCreateInput = {
            title: createShipmentDto.title,
            status: StatusShipmentEnum.PENDING,
            isWaitingForChanges: false,
            inventory: { connect: { id: inventoryId } },
            user: { connect: { id: user.id } },
        };

        const shipment = await this.prismaService.$transaction(async (prisma) => {
            const createdShipment = await this.shipmentRepo.createShipment(shipmentData, prisma);

            if (createShipmentDto.shipmentExpenses?.length) {
                await prisma.shipmentExpense.createMany({
                    data: createShipmentDto.shipmentExpenses.map(expense => ({
                        shipmentId: createdShipment.id,
                        name: expense.name,
                        amount: expense.amount,
                        description: expense.description,
                        tag: expense.tag || ExpenseTag.OTHER,
                    })),
                });
            }

            if (createShipmentDto.shipmentProducts?.length) {
                await prisma.shipmentProduct.createMany({
                    data: createShipmentDto.shipmentProducts.map(product => ({
                        shipmentId: createdShipment.id,
                        productUnitId: product.productUnitId,
                        quantity: product.quantity,
                        piecesPerPallet: product.piecesPerPallet,
                        pallets: product.quantity / product.piecesPerPallet,
                        unitPrice: product.unitPrice,
                        totalPrice: (product.quantity / product.piecesPerPallet) * product.unitPrice,
                    })),
                });
            }

            return createdShipment;
        });

        const totalPrice = await this.prismaService.shipmentExpense
            .aggregate({ where: { shipmentId: shipment.id }, _sum: { amount: true } })
            .then(result => result._sum.amount || 0);

        const shipmentProducts = await this.prismaService.shipmentProduct.findMany({ where: { shipmentId: shipment.id } });
        return ShipmentHelper.mapToResponse(shipment, totalPrice, shipmentProducts);
    }

    async updateShipment(id: number, inventoryId: number, updateShipmentDto: UpdateShipmentDto): Promise<ShipmentResponseDto> {
        const shipment = await this.shipmentRepo.getShipmentById(id);
        if (!shipment) throw new NotFoundException('Shipment not found');
        if (shipment.inventoryId !== inventoryId) throw new BadRequestException('This shipment does not belong to the specified inventory');

        const updateData: Prisma.ShipmentUpdateInput = {};

        updateData.title = updateShipmentDto.title;
        updateData.numberOfTrucks = updateShipmentDto.numberOfTrucks;

        if (updateShipmentDto.shipmentExpenses?.length) {
            await this.prismaService.$transaction(async (prisma) => {
                await prisma.shipmentExpense.deleteMany({ where: { shipmentId: id } });
                await prisma.shipmentExpense.createMany({
                    data: updateShipmentDto.shipmentExpenses.map(expense => ({
                        shipmentId: id,
                        name: expense.name,
                        amount: expense.amount,
                        description: expense.description,
                        tag: expense.tag || ExpenseTag.OTHER,
                    })),
                });
            });
        }

        if (updateShipmentDto.shipmentProducts?.length) {
            await this.prismaService.$transaction(async (prisma) => {
                await prisma.shipmentProduct.deleteMany({ where: { shipmentId: id } });
                await prisma.shipmentProduct.createMany({
                    data: updateShipmentDto.shipmentProducts.map(product => ({
                        shipmentId: id,
                        productUnitId: product.productUnitId,
                        quantity: product.quantity,
                        piecesPerPallet: product.piecesPerPallet,
                        pallets: product.quantity / product.piecesPerPallet,
                        unitPrice: product.unitPrice,
                        totalPrice: (product.quantity / product.piecesPerPallet) * product.unitPrice,
                    })),
                });
            });
        }

        const updatedShipment = await this.shipmentRepo.updateShipment(id, updateData);

        const totalPrice = await this.prismaService.shipmentExpense
            .aggregate({ where: { shipmentId: id }, _sum: { amount: true } })
            .then(result => result._sum.amount || 0);

        const shipmentProducts = await this.prismaService.shipmentProduct.findMany({ where: { shipmentId: id } });
        return ShipmentHelper.mapToResponse(updatedShipment, totalPrice, shipmentProducts);
    }

    async sendForReview(id: number, inventoryId: number, reviewMessage: string, user: User): Promise<ShipmentResponseDto> {
        const shipment = await this.shipmentRepo.getShipmentById(id);
        if (!shipment) throw new NotFoundException('Shipment not found');
        if (shipment.inventoryId !== inventoryId) throw new BadRequestException('This shipment does not belong to the specified inventory');
        if (shipment.status !== StatusShipmentEnum.PENDING) throw new BadRequestException('Shipment must be in PENDING status');
        if (user.role !== 'ADMIN') throw new UnauthorizedException('Only admins can send for review');

        const updatedShipment = await this.shipmentRepo.updateShipment(id, {
            status: StatusShipmentEnum.PENDING_REVIEW,
            isWaitingForChanges: false,
        });
        console.log(`Admin review note: ${reviewMessage} for shipment ${id}`);
        const totalPrice = await this.prismaService.shipmentExpense
            .aggregate({ where: { shipmentId: id }, _sum: { amount: true } })
            .then(result => result._sum.amount || 0);
        const shipmentProducts = await this.prismaService.shipmentProduct.findMany({ where: { shipmentId: id } });
        return ShipmentHelper.mapToResponse(updatedShipment, totalPrice, shipmentProducts);
    }

    async acceptShipment(id: number, inventoryId: number, user: User): Promise<ShipmentResponseDto> {
        const shipment = await this.shipmentRepo.getShipmentById(id);
        if (!shipment) throw new NotFoundException('Shipment not found');
        if (shipment.inventoryId !== inventoryId) throw new BadRequestException('This shipment does not belong to the specified inventory');
        if (shipment.status !== StatusShipmentEnum.PENDING_REVIEW) throw new BadRequestException('Shipment must be in PENDING_REVIEW status');
        if (user.role !== 'ADMIN') throw new UnauthorizedException('Only admins can accept shipment');

        const updatedShipment = await this.shipmentRepo.updateShipment(id, {
            status: StatusShipmentEnum.ACCEPTED,
            isWaitingForChanges: false,
        });
        const totalPrice = await this.prismaService.shipmentExpense
            .aggregate({ where: { shipmentId: id }, _sum: { amount: true } })
            .then(result => result._sum.amount || 0);
        const shipmentProducts = await this.prismaService.shipmentProduct.findMany({ where: { shipmentId: id } });
        return ShipmentHelper.mapToResponse(updatedShipment, totalPrice, shipmentProducts);
    }

    async getShipment(inventoryId: number): Promise<ShipmentResponseDto[]> {
        const shipments = await this.prismaService.shipment.findMany({
            where: { inventoryId },
        });
        if (!shipments.length) throw new NotFoundException('No shipments found for this inventory');

        const response = await Promise.all(shipments.map(async (shipment) => {
            const totalPrice = await this.prismaService.shipmentExpense
                .aggregate({ where: { shipmentId: shipment.id }, _sum: { amount: true } })
                .then(result => result._sum.amount || 0);
            const shipmentProducts = await this.prismaService.shipmentProduct.findMany({ where: { shipmentId: shipment.id } });
            return ShipmentHelper.mapToResponse(shipment, totalPrice, shipmentProducts);
        }));
        return response;
    }

    async getShipmentsCount(): Promise<number> {
        return this.prismaService.shipment.count();
    }

    async getAllShipments(page: number, limit: number): Promise<{ shipments: ShipmentResponseDto[]; total: number }> {
        const skip = (page - 1) * limit;
        const [shipments, total] = await this.prismaService.$transaction([
            this.prismaService.shipment.findMany({
                skip,
                take: limit,
                include: { user: true, inventory: true, shipmentExpenses: true, shipmentProducts: true },
            }),
            this.prismaService.shipment.count(),
        ]);
        const response = await Promise.all(shipments.map(async (shipment) => {
            const totalPrice = await this.prismaService.shipmentExpense
                .aggregate({ where: { shipmentId: shipment.id }, _sum: { amount: true } })
                .then(result => result._sum.amount || 0);
            const shipmentProducts = await this.prismaService.shipmentProduct.findMany({ where: { shipmentId: shipment.id } });
            return ShipmentHelper.mapToResponse(shipment, totalPrice, shipmentProducts);
        }));
        return { shipments: response, total };
    }
}