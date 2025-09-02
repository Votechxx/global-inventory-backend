import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import {
    CreateShipmentDto,
    RequestShipmentUpdateDto,
    ShipmentQueryDto,
    ShipmentResponseDto,
    SubmitShipmentForReview,
    UpdateShipmentDto,
} from './dto/shipment.dto';
import { Prisma, RoleEnum, User } from '@prisma/client';
import { ShipmentRepo } from './repo/shipment.repo';
import { ShipmentHelper } from './helpers/shipment.helper';
import { StatusShipmentEnum, ExpenseTag } from '@prisma/client';
import { InventoryRepo } from 'src/inventory/repo/inventory.repo';
import { ProductUnitRepo } from 'src/product/repo/product-unit.repo';
import { UserRepo } from 'src/core/user/repo/user.repo';

@Injectable()
export class ShipmentService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly userRepo: UserRepo,
        private readonly shipmentRepo: ShipmentRepo,
        private readonly inventoryRepo: InventoryRepo,
        private readonly productUnitRepo: ProductUnitRepo,
    ) {}

    // DONE
    async createShipment(
        createShipmentDto: CreateShipmentDto,
        user: User,
    ): Promise<ShipmentResponseDto> {
        const { inventoryId } = createShipmentDto;
        const inventory = await this.prismaService.inventory.findUnique({
            where: { id: inventoryId },
        });
        if (!inventory) throw new NotFoundException('Inventory not found');

        const existingShipment =
            await this.shipmentRepo.getActiveShipmentOfInventory(inventoryId);
        if (existingShipment) {
            throw new BadRequestException(
                'There is already an active shipment for this inventory',
            );
        }

        const shipmentData: Prisma.ShipmentCreateInput = {
            title: createShipmentDto.title,
            status: StatusShipmentEnum.PENDING,
            inventory: { connect: { id: inventoryId } },
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
                                tag: expense.tag || ExpenseTag.OTHER,
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

        const shipmentProducts =
            await this.prismaService.shipmentProduct.findMany({
                where: { shipmentId: shipment.id },
            });
        return ShipmentHelper.mapToResponse(
            shipment,
            totalPrice,
            shipmentProducts,
        );
    }

    // DONE
    async updateShipment(
        id: number,
        updateShipmentDto: UpdateShipmentDto,
    ): Promise<ShipmentResponseDto> {
        const shipment = await this.shipmentRepo.getShipmentById(id);
        if (!shipment) throw new NotFoundException('Shipment not found');

        const updateData: Prisma.ShipmentUpdateInput = {};

        updateData.title = updateShipmentDto.title;

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
                        tag: expense.tag || ExpenseTag.OTHER,
                    })),
                });
            });
        }

        // if (updateShipmentDto.shipmentProducts?.length) {
        //     await this.prismaService.$transaction(async (prisma) => {
        //         await prisma.shipmentProduct.deleteMany({
        //             where: { shipmentId: id },
        //         });
        //         await prisma.shipmentProduct.createMany({
        //             data: updateShipmentDto.shipmentProducts.map((product) => ({
        //                 shipmentId: id,
        //                 productUnitId: product.productUnitId,
        //                 quantity: product.quantity,
        //                 piecesPerPallet: product.piecesPerPallet,
        //                 pallets: product.quantity / product.piecesPerPallet,
        //                 unitPrice: product.unitPrice,
        //                 totalPrice:
        //                     (product.quantity / product.piecesPerPallet) *
        //                     product.unitPrice,
        //             })),
        //         });
        //     });
        // }

        const updatedShipment = await this.shipmentRepo.updateShipment(
            id,
            updateData,
        );

        const totalPrice = await this.prismaService.shipmentExpense
            .aggregate({ where: { shipmentId: id }, _sum: { amount: true } })
            .then((result) => result._sum.amount || 0);

        const shipmentProducts =
            await this.prismaService.shipmentProduct.findMany({
                where: { shipmentId: id },
            });
        return ShipmentHelper.mapToResponse(
            updatedShipment,
            totalPrice,
            shipmentProducts,
        );
    }

    // DONE
    async requestUpdate(
        id: number,
        body: RequestShipmentUpdateDto,
    ): Promise<ShipmentResponseDto> {
        const shipment = await this.shipmentRepo.getShipmentById(id);
        if (!shipment) throw new NotFoundException('Shipment not found');
        if (shipment.status !== StatusShipmentEnum.PENDING_REVIEW)
            throw new BadRequestException('Shipment must be in review status');
        const updatedShipment = await this.shipmentRepo.updateShipment(id, {
            status: StatusShipmentEnum.PENDING,
            reasonMessage: body.reviewMessage,
        });
        const totalPrice = await this.prismaService.shipmentExpense
            .aggregate({ where: { shipmentId: id }, _sum: { amount: true } })
            .then((result) => result._sum.amount || 0);
        const shipmentProducts =
            await this.prismaService.shipmentProduct.findMany({
                where: { shipmentId: id },
            });
        return ShipmentHelper.mapToResponse(
            updatedShipment,
            totalPrice,
            shipmentProducts,
        );
    }

    // DONE
    async acceptShipment(id: number): Promise<ShipmentResponseDto> {
        const shipment = await this.shipmentRepo.getShipmentById(id);
        if (!shipment) throw new NotFoundException('Shipment not found');

        if (shipment.status !== StatusShipmentEnum.PENDING_REVIEW)
            throw new BadRequestException('Shipment must be in review status');

        const updatedShipment = await this.prismaService.$transaction(
            async (prisma) => {
                // update the inventory stock based on shipment products
                // also update the current balance of the inventory
                await Promise.all(
                    shipment.shipmentProducts.map(async (product) => {
                        await this.productUnitRepo.addMoreUnits(
                            product.quantity,
                            product.productUnitId,
                            prisma,
                        );
                    }),
                );
                await this.inventoryRepo.decrementInventoryBalance(
                    shipment.inventoryId,
                    shipment.clarkInstallmentExpenses +
                        shipment.otherExpenses +
                        shipment.shipmentCardExpenses,
                    prisma,
                );
                const updatedShipment = await this.shipmentRepo.updateShipment(
                    id,
                    {
                        status: StatusShipmentEnum.ACCEPTED,
                    },
                    prisma,
                );
                return updatedShipment;
            },
        );

        const totalPrice = await this.prismaService.shipmentExpense
            .aggregate({ where: { shipmentId: id }, _sum: { amount: true } })
            .then((result) => result._sum.amount || 0);
        const shipmentProducts =
            await this.prismaService.shipmentProduct.findMany({
                where: { shipmentId: id },
            });

        return ShipmentHelper.mapToResponse(
            updatedShipment,
            totalPrice,
            shipmentProducts,
        );
    }

    // DONE
    async getShipment(shipmentId: number): Promise<ShipmentResponseDto[]> {
        const shipment = await this.prismaService.shipment.findUnique({
            where: { id: shipmentId },
            include: {
                user: true,
                inventory: true,
                shipmentExpenses: true,
                shipmentProducts: {
                    include: {
                        productUnit: {
                            select: {
                                id: true,
                                quantity: true,
                                value: true,
                                createdAt: true,
                                updatedAt: true,
                                product: {
                                    select: {
                                        id: true,
                                        name: true,
                                        price: true,
                                        createdAt: true,
                                        updatedAt: true,
                                        inventoryId: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!shipment) throw new NotFoundException('Shipment not found');

        const totalPrice = await this.prismaService.shipmentExpense
            .aggregate({
                where: { shipmentId: shipment.id },
                _sum: { amount: true },
            })
            .then((result) => result._sum.amount || 0);

        return [
            ShipmentHelper.mapToResponse(
                shipment,
                totalPrice,
                shipment.shipmentProducts,
                shipment.shipmentExpenses,
            ),
        ];
    }

    // DONE
    async getShipmentsCount(): Promise<number> {
        return this.prismaService.shipment.count();
    }

    // DONE
    async getAllShipments(
        query: ShipmentQueryDto,
        user: User,
    ): Promise<{ shipments: ShipmentResponseDto[]; total: number }> {
        const currentUser = await this.userRepo.getUserById(user.id);

        const { page = 1, limit = 10, title, ...filter } = query;
        const skip = (page - 1) * limit;

        const where: Prisma.ShipmentWhereInput = {
            ...filter,
            title: title ? { contains: title, mode: 'insensitive' } : undefined,
        };

        if (user.role === RoleEnum.USER)
            where.inventoryId = currentUser.inventoryId;

        const [shipments, total] = await this.prismaService.$transaction([
            this.prismaService.shipment.findMany({
                where,
                skip,
                take: limit,
                include: {
                    user: true,
                    inventory: true,
                    shipmentExpenses: true,
                    shipmentProducts: true,
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
                const shipmentProducts =
                    await this.prismaService.shipmentProduct.findMany({
                        where: { shipmentId: shipment.id },
                    });
                return ShipmentHelper.mapToResponse(
                    shipment,
                    totalPrice,
                    shipmentProducts,
                );
            }),
        );
        return { shipments: response, total };
    }

    // DONE
    async submitShipmentForReview(
        id: number,
        body: SubmitShipmentForReview,
        user: User,
    ) {
        const shipment = await this.shipmentRepo.getShipmentById(id);
        if (!shipment) throw new NotFoundException('Shipment not found');
        if (shipment.status !== StatusShipmentEnum.PENDING)
            throw new BadRequestException(
                'Only shipments in pending status can be submitted for review',
            );
        const currentUser = await this.userRepo.getUserById(user.id);
        if (currentUser.inventoryId !== shipment.inventoryId) {
            throw new ForbiddenException(
                'You do not have permission to submit this shipment for review',
            );
        }

        const updatedShipment = await this.prismaService.$transaction(
            async (prisma) => {
                await prisma.shipmentProduct.deleteMany({
                    where: { shipmentId: id },
                });
                if (body.addShipmentProducts?.length) {
                    const productUnites =
                        await this.productUnitRepo.getProductUnitsByIdsWithDetails(
                            body.addShipmentProducts.map(
                                (p) => p.productUnitId,
                            ),
                        );
                    const mergedProductUnits = body.addShipmentProducts.map(
                        (product) => {
                            const productUnit = productUnites.find(
                                (p) => p.id === product.productUnitId,
                            );
                            if (!productUnit)
                                throw new NotFoundException(
                                    `Product unit with ID ${product.productUnitId} not found`,
                                );
                            if (
                                productUnit.product.inventoryId !==
                                shipment.inventoryId
                            )
                                throw new BadRequestException(
                                    `Product unit with ID ${product.productUnitId} does not belong to the same inventory`,
                                );
                            return {
                                ...productUnit,
                                newQuantity: product.quantity,
                            };
                        },
                    );
                    await prisma.shipmentProduct.createMany({
                        data: mergedProductUnits.map((productUnit) => ({
                            shipmentId: id,
                            productUnitId: productUnit.id,
                            quantity: productUnit.newQuantity,
                            piecesPerPallet: productUnit.quantity,
                            pallets:
                                productUnit.newQuantity / productUnit.quantity,
                            unitPrice: productUnit.product.price,
                            totalPrice:
                                (productUnit.newQuantity /
                                    productUnit.quantity) *
                                productUnit.product.price,
                        })),
                    });
                }
                return await this.shipmentRepo.updateShipment(id, {
                    status: StatusShipmentEnum.PENDING_REVIEW,
                    clarkInstallmentExpenses: body.clarkInstallmentExpenses,
                    otherExpenses: body.otherExpenses,
                    shipmentCardExpenses: body.shipmentCardExpenses,
                });
            },
        );

        const totalPrice = await this.prismaService.shipmentExpense
            .aggregate({ where: { shipmentId: id }, _sum: { amount: true } })
            .then((result) => result._sum.amount || 0);
        const shipmentProducts =
            await this.prismaService.shipmentProduct.findMany({
                where: { shipmentId: id },
            });

        return ShipmentHelper.mapToResponse(
            updatedShipment,
            totalPrice,
            shipmentProducts,
        );
    }
}
