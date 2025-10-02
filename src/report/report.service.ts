import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import {
    ReportQueryDto,
    ReportStatisticsDto,
    RequestChangeDto,
    SubmitDepositDto,
    UserCreateReportDto,
} from './dto/report.dto';
import { Expense, ReportStatusEnum, RoleEnum, User } from '@prisma/client';
import { UserRepo } from 'src/core/user/repo/user.repo';
import { ReportRepo } from './repo/report.repo';
import { ReportProductRepo } from './repo/report-product.repo';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import { CreateReportProductDto } from './dto/report-product.dto';
import { ProductUnitRepo } from 'src/product/repo/product-unit.repo';
import { ExpenseRepo } from 'src/expense/repo/expense.repo';
import { FileRepo } from 'src/file/repo/file.repo';
import { FileCategoryEnum } from 'src/file/enum/file-category.enum';
import { InventoryRepo } from 'src/inventory/repo/inventory.repo';

@Injectable()
export class ReportService {
    constructor(
        private readonly userRepo: UserRepo,
        private readonly reportRepo: ReportRepo,
        private readonly reportProductRepo: ReportProductRepo,
        private readonly prismaService: PrismaService,
        private readonly productUnitRepo: ProductUnitRepo,
        private readonly expenseRepo: ExpenseRepo,
        private readonly fileRepo: FileRepo,
        private readonly inventoryRepo: InventoryRepo,
    ) {}
    /*
        1. set the products to the current values
        2. expectedSelledMoneyAmount = sum(countProduct, productPrice)
        3. totalExpensesMoneyAmount = sum(newExpenses)
        4. netMoneyAmount = expectedSelledMoneyAmount - totalExpensesMoneyAmount
        5. currentMoneyAmount = Input()
        6. depositMoneyAmount = Input() - later will be sent in another endpoint
        7. realNetMoneyAmount = (currentMoneyAmount - currentBalance)   it should be equal to netMoneyAmount.
        8. brokenMoneyAmount = netMoneyAmount - realNetMoneyAmount
        9. brokenRate = brokenMoneyAmount * 100 / expectedSelledMoneyAmount
    */
    async userCreate(body: UserCreateReportDto, user: User) {
        const currentUser = await this.userRepo.getUserByIdWithInventory(
            user.id,
        );
        if (!currentUser) throw new NotFoundException('User not found');

        const userId = currentUser.id;
        const inventoryId = currentUser.inventoryId;

        const activeReport =
            await this.reportRepo.getActiveReportByInventoryId(inventoryId);
        if (activeReport)
            throw new BadRequestException(
                'You have an active report. Please close it before creating a new one.',
            );

        const productUnits =
            await this.productUnitRepo.getProductUnitsByInventoryId(
                inventoryId,
            );

        const currentProductUnits = productUnits.map((productUnit) => {
            const product = body.products.find(
                (p) => p.productUnitId === productUnit.id,
            );
            // if product not found, throw error
            if (!product) {
                throw new NotFoundException(
                    `Product with id ${productUnit.id} not found in the list provided`,
                );
            }
            return {
                ...productUnit,
                passedQuantity: product.quantity,
            };
        });
        if (productUnits.length !== body.products.length) {
            throw new NotFoundException(
                `We have ${productUnits.length} products in the inventory, but you provided ${body.products.length} products`,
            );
        }

        // expectedSelledMoneyAmount = sum(countProduct, productPrice)
        const expectedSelledMoneyAmount = currentProductUnits.reduce(
            (acc, product) =>
                acc +
                Math.max(
                    product.product.price * product.value -
                        product.product.price * product.passedQuantity,
                    0,
                ),
            0,
        );

        const expenses =
            await this.expenseRepo.getAllNewExpensesForInventory(inventoryId);
        const totalExpensesMoneyAmount = expenses.reduce(
            (acc: number, expense: Expense) => acc + expense.amount,
            0,
        );

        const netMoneyAmount =
            expectedSelledMoneyAmount - totalExpensesMoneyAmount;

        if (body.currentMoneyAmount < currentUser.inventory.currentBalance)
            throw new BadRequestException(
                'Current money amount cannot be less than the current balance of the inventory',
            );

        const realNetMoneyAmount =
            body.currentMoneyAmount - currentUser.inventory.currentBalance;

        const brokenMoneyAmount = netMoneyAmount - realNetMoneyAmount;

        const brokenRate =
            expectedSelledMoneyAmount === 0
                ? 0
                : (brokenMoneyAmount * 100) / expectedSelledMoneyAmount;

        const newReport = await this.prismaService.$transaction(
            async (prisma) => {
                // update records
                const createdReport = await this.reportRepo.createNewReport(
                    {
                        userId,
                        inventoryId,
                        expectedSelledMoneyAmount,
                        totalExpensesMoneyAmount,
                        brokenMoneyAmount,
                        brokenRate,
                        netMoneyAmount,
                        currentMoneyAmount: body.currentMoneyAmount,
                        title: body.title,
                        realNetMoneyAmount,
                    },
                    prisma,
                );
                await this.expenseRepo.markExpensesToReport(
                    expenses.map((expense) => expense.id),
                    createdReport.id,
                    prisma,
                );
                const createProducts: CreateReportProductDto[] =
                    currentProductUnits.map((product) => ({
                        piecesPerPallet: product.quantity,
                        quantity: product.passedQuantity,
                        pallets: product.passedQuantity / product.quantity,
                        productUnitId: product.id,
                        reportId: createdReport.id,
                        unitPrice: product.product.price,
                        totalPrice:
                            product.product.price * product.passedQuantity,
                        soldUnits: product.value - product.passedQuantity,
                        soldUnitsAmount:
                            (product.value - product.passedQuantity) *
                            product.product.price,
                    }));
                await this.reportProductRepo.createReportProduct(
                    createProducts,
                    prisma,
                );
                return createdReport;
            },
        );

        return newReport;
    }

    async findAll(query: ReportQueryDto, user: User) {
        if (user.role === RoleEnum.USER) query.userId = user.id;
        return this.reportRepo.findAllReports(query);
    }

    async findOne(id: number, user: User) {
        const currentUser = await this.userRepo.getUserById(user.id);
        if (!currentUser) throw new NotFoundException('User not found');
        const report = await this.reportRepo.getReportDetails(id);
        if (!report) throw new NotFoundException('Report not found');
        if (
            user.role === RoleEnum.USER &&
            report.inventoryId !== currentUser.inventoryId
        )
            throw new NotFoundException('Report not found');
        return report;
    }

    async requestChanges(reportId: number, body: RequestChangeDto) {
        const report = await this.reportRepo.getReportById(reportId);
        if (!report) throw new NotFoundException('Report not found');
        if (report.status !== ReportStatusEnum.IN_REVIEW)
            throw new BadRequestException(
                'Only reports in review can be requested changes',
            );
        return this.reportRepo.updateReportById(reportId, {
            status: ReportStatusEnum.REQUESTED_CHANGES,
            reasonMessage: body.reasonMessage,
        });
    }

    async updateReportAfterReview(
        reportId: number,
        body: UserCreateReportDto,
        user: User,
    ) {
        const currentUser = await this.userRepo.getUserByIdWithInventory(
            user.id,
        );
        if (!currentUser) throw new NotFoundException('User not found');
        const report = await this.reportRepo.getReportById(reportId);
        if (!report) throw new NotFoundException('Report not found');
        if (report.status !== ReportStatusEnum.REQUESTED_CHANGES)
            throw new BadRequestException(
                'Only reports with requested changes can be updated',
            );
        if (report.inventoryId !== currentUser.inventoryId)
            throw new BadRequestException(
                'You can only update reports from your inventory',
            );

        const productUnits =
            await this.productUnitRepo.getProductUnitsByInventoryId(
                currentUser.inventoryId,
            );
        const currentProductUnits = productUnits.map((productUnit) => {
            const product = body.products.find(
                (p) => p.productUnitId === productUnit.id,
            );
            // if product not found, throw error
            if (!product) {
                throw new NotFoundException(
                    `Product with id ${productUnit.id} not found in the list provided`,
                );
            }
            return {
                ...productUnit,
                passedQuantity: product.quantity,
            };
        });
        if (productUnits.length !== body.products.length) {
            throw new NotFoundException(
                `We have ${productUnits.length} products in the inventory, but you provided ${body.products.length} products`,
            );
        }

        // expectedSelledMoneyAmount = sum(countProduct, productPrice)
        const expectedSelledMoneyAmount = currentProductUnits.reduce(
            (acc, product) =>
                acc +
                Math.max(
                    product.product.price * product.value -
                        product.product.price * product.passedQuantity,
                    0,
                ),
            0,
        );

        const expenses =
            await this.expenseRepo.getAllNewExpensesAndReportExpensesForInventory(
                currentUser.inventoryId,
                reportId,
            );
        const totalExpensesMoneyAmount = expenses.reduce(
            (acc: number, expense: Expense) => acc + expense.amount,
            0,
        );

        const netMoneyAmount =
            expectedSelledMoneyAmount - totalExpensesMoneyAmount;

        if (body.currentMoneyAmount < currentUser.inventory.currentBalance)
            throw new BadRequestException(
                'Current money amount cannot be less than the current balance of the inventory',
            );

        const realNetMoneyAmount =
            body.currentMoneyAmount - currentUser.inventory.currentBalance;

        const brokenMoneyAmount = netMoneyAmount - realNetMoneyAmount;

        const brokenRate =
            expectedSelledMoneyAmount === 0
                ? 0
                : (brokenMoneyAmount * 100) / expectedSelledMoneyAmount;

        const updatedReport = await this.prismaService.$transaction(
            async (prisma) => {
                // update records
                const newReport = await this.reportRepo.updateReportById(
                    reportId,
                    {
                        status: ReportStatusEnum.IN_REVIEW,
                        expectedSelledMoneyAmount,
                        totalExpensesMoneyAmount,
                        brokenMoneyAmount,
                        brokenRate,
                        netMoneyAmount,
                        currentMoneyAmount: body.currentMoneyAmount,
                        title: body.title,
                        realNetMoneyAmount,
                    },
                    prisma,
                );
                await this.expenseRepo.markExpensesToReport(
                    expenses.map((expense) => expense.id),
                    newReport.id,
                    prisma,
                );
                await this.reportProductRepo.deleteReportProductsByReportId(
                    reportId,
                    prisma,
                );
                const createProducts: CreateReportProductDto[] =
                    currentProductUnits.map((product) => ({
                        piecesPerPallet: product.quantity,
                        quantity: product.passedQuantity,
                        pallets: product.passedQuantity / product.quantity,
                        productUnitId: product.id,
                        reportId: newReport.id,
                        unitPrice: product.product.price,
                        totalPrice:
                            product.product.price * product.passedQuantity,
                        soldUnits: product.value - product.passedQuantity,
                        soldUnitsAmount:
                            (product.value - product.passedQuantity) *
                            product.product.price,
                    }));
                await this.reportProductRepo.createReportProduct(
                    createProducts,
                    prisma,
                );
                return newReport;
            },
        );

        return updatedReport;
    }

    async acceptLevelOne(reportId: number) {
        const report = await this.reportRepo.getReportById(reportId);
        if (!report) throw new NotFoundException('Report not found');
        if (report.status !== ReportStatusEnum.IN_REVIEW)
            throw new BadRequestException(
                'Only IN_REVIEW reports can be moved to deposit',
            );
        return this.reportRepo.updateReportStatus(
            reportId,
            ReportStatusEnum.PENDING_DEPOSIT,
        );
    }

    async submitDepositForReport(
        reportId: number,
        body: SubmitDepositDto,
        user: User,
    ) {
        const currentUser = await this.userRepo.getUserByIdWithInventory(
            user.id,
        );
        if (!currentUser) throw new NotFoundException('User not found');
        const report = await this.reportRepo.getReportById(reportId);
        if (!report) throw new NotFoundException('Report not found');
        if (report.status !== ReportStatusEnum.PENDING_DEPOSIT)
            throw new BadRequestException(
                'Only PENDING_DEPOSIT reports can be moved to deposit review',
            );
        if (report.inventoryId !== currentUser.inventoryId)
            throw new BadRequestException(
                'You can only submit deposit for reports from your inventory',
            );
        if (body.depositMoneyAmount > report.currentMoneyAmount)
            throw new BadRequestException(
                'Deposit money amount cannot be greater than current money amount of the report',
            );
        const file = await this.fileRepo.getUnAssociatedFileByIdAndCategory(
            body.depositImageId,
            FileCategoryEnum.REPORT_DEPOSIT,
        );
        if (!file) throw new NotFoundException('Deposit image file not found');

        await this.prismaService.$transaction(async (prisma) => {
            await this.fileRepo.markFilesAsUsed([file.id], prisma);
            return await this.reportRepo.updateReportById(
                reportId,
                {
                    depositMoneyAmount: body.depositMoneyAmount,
                    depositImage: {
                        connect: { id: file.id },
                    },
                    status: ReportStatusEnum.IN_PENDING_DEPOSIT_REVIEW,
                },
                prisma,
            );
        });
    }

    async requestChangesAtDeposit(reportId: number, body: RequestChangeDto) {
        const report = await this.reportRepo.getReportById(reportId);
        if (!report) throw new NotFoundException('Report not found');
        if (report.status !== ReportStatusEnum.IN_PENDING_DEPOSIT_REVIEW)
            throw new BadRequestException(
                'Only reports in pending deposit review can be requested changes',
            );
        return this.reportRepo.updateReportById(reportId, {
            status: ReportStatusEnum.PENDING_DEPOSIT,
            reasonMessage: body.reasonMessage,
        });
    }

    async finalAccept(reportId: number) {
        const report = await this.reportRepo.getReportById(reportId);
        if (!report) throw new NotFoundException('Report not found');
        if (report.status !== ReportStatusEnum.IN_PENDING_DEPOSIT_REVIEW)
            throw new BadRequestException(
                'Only IN_PENDING_DEPOSIT_REVIEW reports can be finally accepted',
            );

        const additionalBalance =
            report.realNetMoneyAmount - (report.depositMoneyAmount || 0);

        // 1. update status of report
        // 2. update inventory balance
        // 3. mark all expenses applied
        await this.prismaService.$transaction(async (prisma) => {
            await this.reportRepo.updateReportStatus(
                reportId,
                ReportStatusEnum.ACCEPTED,
                prisma,
            );
            await this.inventoryRepo.incrementInventoryBalance(
                report.inventoryId,
                additionalBalance,
                prisma,
            );
            await this.expenseRepo.markExpensesAsAppliedForReport(
                report.id,
                prisma,
            );
        });
    }

    async getStatistics(query: ReportStatisticsDto) {
        return this.reportRepo.getReportStatistics(query);
    }
}
