import {
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import {
    CreateShipmentDto,
    ShipmentResponseDto,
    UpdateShipmentDto,
} from './dto/shipment.dto';
import { Prisma, User } from '@prisma/client';
import { ShipmentRepo } from './repo/shipment.repo';
import { ShipmentHelper } from './helpers/shipment.helper';
import { StatusShipmentEnum, ExpenseTag } from '@prisma/client';
import { InventoryService } from '../inventory/inventory.service';
import { startOfWeek, endOfWeek } from 'date-fns';

@Injectable()
export class ShipmentService {
    constructor(
        private prismaService: PrismaService,
        private readonly shipmentRepo: ShipmentRepo,
        private readonly shipmentHelper: ShipmentHelper,
        private readonly inventoryService: InventoryService,
    ) {}

    async createShipment(
        createShipmentDto: CreateShipmentDto,
        user: User,
    ): Promise<ShipmentResponseDto> {
        if (user.role !== 'ADMIN') {
            throw new UnauthorizedException('Only admins can create shipments');
        }

        const inventory = await this.prismaService.inventory.findUnique({
            where: { id: createShipmentDto.inventoryId },
        });
        if (!inventory) throw new NotFoundException('Inventory not found');

        const existingShipment =
            await this.shipmentRepo.getActiveShipmentOfInventory(
                createShipmentDto.inventoryId,
            );
        if (existingShipment) {
            throw new UnauthorizedException(
                'There is already an active shipment for this inventory',
            );
        }

        const shipmentData: Prisma.ShipmentCreateInput = {
            title: createShipmentDto.title,
            status: StatusShipmentEnum.PENDING,
            isWaitingForChanges: false,
            inventory: { connect: { id: createShipmentDto.inventoryId } },
            user: { connect: { id: user.id } },
        };

        const shipment = await this.prismaService.$transaction(
            async (prisma) => {
                const createdShipment = await this.shipmentRepo.createShipment(
                    shipmentData,
                    prisma,
                );

                if (createShipmentDto.shipmentExpenses?.length) {
                    await prisma.shipmentExpense.createMany({
                        data: createShipmentDto.shipmentExpenses.map(
                            (expense) => ({
                                shipmentId: createdShipment.id,
                                name: expense.name,
                                amount: expense.amount,
                                description: expense.description,
                                tag: expense.tag
                                    ? Object.values(ExpenseTag).includes(
                                          expense.tag as any,
                                      )
                                        ? (expense.tag as ExpenseTag)
                                        : ExpenseTag.OTHER
                                    : ExpenseTag.OTHER,
                            }),
                        ),
                    });
                }

                return createdShipment;
            },
        );

        const totalPrice = await this.prismaService.shipmentExpense
            .aggregate({
                where: { shipmentId: shipment.id },
                _sum: { amount: true },
            })
            .then((result) => result._sum.amount || 0);

        return ShipmentHelper.mapToResponse(shipment, totalPrice);
    }

    async updateShipment(
        id: number,
        updateShipmentDto: UpdateShipmentDto,
        user: User,
    ): Promise<ShipmentResponseDto> {
        const shipment = await this.shipmentRepo.getShipmentById(id);
        if (!shipment) throw new NotFoundException('Shipment not found');

        const updateData: any = {};

        if (user.role !== 'ADMIN') {
            throw new UnauthorizedException(
                'Only admins can update shipment status',
            );
        }

        updateData.title = updateShipmentDto.title;
        updateData.numberOfTrucks = updateShipmentDto.numberOfTrucks;

        // TODO remove this from update and make endpoint for each status and validate each status if its ready to be taken
        // for example if the status is pending so i never can set it to accepted so prevent that and any other invalid case

        // // Status transition logic
        // if (
        //     shipment.status === StatusShipmentEnum.PENDING &&
        //     updateShipmentDto.status === StatusShipmentEnum.PENDING_REVIEW
        // ) {
        //     updateData.status = StatusShipmentEnum.PENDING_REVIEW;
        //     updateData.isWaitingForChanges = false;
        //     if (updateShipmentDto.reviewMessage) {
        //         console.log(
        //             `Admin review note: ${updateShipmentDto.reviewMessage} for shipment ${id}`,
        //         );
        //     }
        // } else if (shipment.status === StatusShipmentEnum.PENDING_REVIEW) {
        //     if (updateShipmentDto.isWaitingForChanges) {
        //         updateData.status = StatusShipmentEnum.PENDING;
        //         updateData.isWaitingForChanges = true;
        //         if (updateShipmentDto.reviewMessage) {
        //             console.log(
        //                 `Admin returned shipment ${id} to PENDING with feedback: ${updateShipmentDto.reviewMessage}`,
        //             );
        //         }
        //     } else if (
        //         updateShipmentDto.status === StatusShipmentEnum.ACCEPTED
        //     ) {
        //         updateData.status = StatusShipmentEnum.ACCEPTED;
        //         updateData.isWaitingForChanges = false;
        //         await this.updateInventoryOnAccept(shipment);
        //     }
        // }

        if (updateShipmentDto.shipmentExpenses?.length) {
            await this.prismaService.$transaction(async (prisma) => {
                await prisma.shipmentExpense.deleteMany({
                    where: { shipmentId: id },
                });
                await prisma.shipmentExpense.createMany({
                    data: updateShipmentDto.shipmentExpenses.map((expense) => ({
                        shipmentId: id,
                        name: expense.name,
                        amount: expense.amount,
                        description: expense.description,
                        tag: expense.tag
                            ? Object.values(ExpenseTag).includes(
                                  expense.tag as any,
                              )
                                ? (expense.tag as ExpenseTag)
                                : ExpenseTag.OTHER
                            : ExpenseTag.OTHER,
                    })),
                });
            });
        }

        const updatedShipment = await this.shipmentRepo.updateShipment(
            id,
            updateData,
        );

        const totalPrice = await this.prismaService.shipmentExpense
            .aggregate({ where: { shipmentId: id }, _sum: { amount: true } })
            .then((result) => result._sum.amount || 0);

        return ShipmentHelper.mapToResponse(updatedShipment, totalPrice);
    }

    async getShipment(id: number): Promise<ShipmentResponseDto> {
        const shipment = await this.shipmentRepo.getShipmentById(id);
        if (!shipment) throw new NotFoundException('Shipment not found');
        const totalPrice = await this.prismaService.shipmentExpense
            .aggregate({ where: { shipmentId: id }, _sum: { amount: true } })
            .then((result) => result._sum.amount || 0);
        return ShipmentHelper.mapToResponse(shipment, totalPrice);
    }

    async getShipmentsCount(): Promise<number> {
        return this.prismaService.shipment.count();
    }

    async getAllShipments(
        page: number,
        limit: number,
    ): Promise<{ shipments: ShipmentResponseDto[]; total: number }> {
        const skip = (page - 1) * limit;
        const [shipments, total] = await this.prismaService.$transaction([
            this.prismaService.shipment.findMany({
                skip,
                take: limit,
                include: {
                    user: true,
                    inventory: true,
                    shipmentExpenses: true,
                },
            }),
            this.prismaService.shipment.count(),
        ]);
        const response = await Promise.all(
            shipments.map(async (shipment) => {
                const totalPrice = await this.prismaService.shipmentExpense
                    .aggregate({
                        where: { shipmentId: shipment.id },
                        _sum: { amount: true },
                    })
                    .then((result) => result._sum.amount || 0);
                return ShipmentHelper.mapToResponse(shipment, totalPrice);
            }),
        );
        return { shipments: response, total };
    }

    async updateInventoryOnAccept(shipment: any) {
        const inventory = await this.prismaService.inventory.findUnique({
            where: { id: shipment.inventoryId },
        });
        if (!inventory) throw new NotFoundException('Inventory not found');

        // Calculate financials based on shipment
        const totalExpenses = await this.prismaService.shipmentExpense
            .aggregate({
                where: { shipmentId: shipment.id },
                _sum: { amount: true },
            })
            .then((result) => result._sum.amount || 0);

        const expectedCash = shipment.numberOfTrucks * 1000;
        const currentBalanceFromInventory = inventory.currentBalance || 0;
        const currentBalance = currentBalanceFromInventory + expectedCash;
        const netCash = expectedCash - totalExpenses; // Cash in hand
        const deposit = expectedCash * 0.8; // 80% deposit
        const cashAfterDeposit = currentBalance - deposit; // المرحل

        // Update inventory with calculated values
        await this.prismaService.inventory.update({
            where: { id: shipment.inventoryId },
            data: {
                name: `${inventory.name} (Accepted)`,
                currentBalance: currentBalance,
                totalBalance: currentBalance + deposit, // Total balance includes deposit
                deposit: deposit,
                expenses: totalExpenses,
            },
        });

        // Update ProductUnit quantities directly
        await this.prismaService.productUnit.updateMany({
            where: { product: { inventoryId: shipment.inventoryId } },
            data: { quantity: { increment: shipment.numberOfTrucks * 10 } },
        });
    }

    async getWeeklySummary(): Promise<any> {
        const startOfCurrentWeek = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
        const endOfCurrentWeek = endOfWeek(new Date(), { weekStartsOn: 1 });
        const weeklyShipments = await this.prismaService.shipment.findMany({
            where: {
                status: StatusShipmentEnum.ACCEPTED,
                updatedAt: { gte: startOfCurrentWeek, lte: endOfCurrentWeek },
            },
            include: { shipmentExpenses: true },
        });

        let weeklyExpectedCash = 0;
        let weeklyTotalExpenses = 0;
        weeklyShipments.forEach((s) => {
            weeklyExpectedCash += s.numberOfTrucks * 1000;
            weeklyTotalExpenses += s.shipmentExpenses.reduce(
                (sum, exp) => sum + exp.amount,
                0,
            );
        });

        const weeklyNetCash = weeklyExpectedCash - weeklyTotalExpenses;
        const weeklyCashAfterDeposit =
            weeklyExpectedCash - weeklyExpectedCash * 0.8;

        return {
            startOfWeek: startOfCurrentWeek,
            endOfWeek: endOfCurrentWeek,
            expectedCash: weeklyExpectedCash,
            totalExpenses: weeklyTotalExpenses,
            netCash: weeklyNetCash,
            cashAfterDeposit: weeklyCashAfterDeposit,
        };
    }
}
