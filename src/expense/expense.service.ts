import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import {
    CreateExpenseDto,
    ExpenseQueryDto,
    UpdateExpenseDto,
    UserCreateExpenseDto,
} from './dto/expense.dto';
import { ExpenseRepo } from './repo/expense.repo';
import { ReportStatusEnum, RoleEnum, User } from '@prisma/client';
import { UserRepo } from 'src/core/user/repo/user.repo';
import { ReportRepo } from 'src/report/repo/report.repo';

@Injectable()
export class ExpenseService {
    constructor(
        private prismaService: PrismaService,
        private readonly expenseRepo: ExpenseRepo,
        private readonly userRepo: UserRepo,
        private readonly reportRepo: ReportRepo,
    ) {}

    async createExpense(
        userCreateExpenseDto: UserCreateExpenseDto,
        userId: number,
    ) {
        const currentUser = await this.userRepo.getUserById(userId);
        if (!currentUser) throw new NotFoundException('User not found');

        const inventory = await this.prismaService.inventory.findUnique({
            where: { id: currentUser.inventoryId },
        });
        if (!inventory) throw new NotFoundException('Inventory not found');

        const activeReport = await this.reportRepo.getActiveReportByInventoryId(
            inventory.id,
        );

        if (
            activeReport &&
            activeReport.status !== ReportStatusEnum.REQUESTED_CHANGES
        ) {
            throw new NotFoundException(
                'Cannot create expense when there is an active report not in REQUESTED_CHANGES status',
            );
        }

        const createExpenseDto: CreateExpenseDto = {
            ...userCreateExpenseDto,
            userId,
            inventoryId: inventory.id,
        };

        return this.prismaService.$transaction(async (prisma) => {
            const expense = await this.expenseRepo.createExpense(
                createExpenseDto,
                prisma,
            );
            if (activeReport) {
                const expectedSelledMoneyAmount =
                    activeReport.expectedSelledMoneyAmount;
                const totalExpensesMoneyAmount =
                    activeReport.totalExpensesMoneyAmount + expense.amount;
                const netMoneyAmount =
                    expectedSelledMoneyAmount - totalExpensesMoneyAmount;
                const realNetMoneyAmount =
                    activeReport.currentMoneyAmount - inventory.currentBalance;
                const brokenMoneyAmount = netMoneyAmount - realNetMoneyAmount;
                const brokenRate =
                    expectedSelledMoneyAmount === 0
                        ? 0
                        : (brokenMoneyAmount * 100) / expectedSelledMoneyAmount;
                await this.reportRepo.updateReportById(
                    activeReport.id,
                    {
                        totalExpensesMoneyAmount,
                        netMoneyAmount,
                        realNetMoneyAmount,
                        brokenMoneyAmount,
                        brokenRate,
                    },
                    prisma,
                );
                await this.expenseRepo.markExpensesToReport(
                    [expense.id],
                    activeReport.id,
                    prisma,
                );
            }
            return expense;
        });
    }

    async getExpense(id: number) {
        const expense = await this.expenseRepo.getExpenseById(id);
        if (!expense) throw new NotFoundException('Expense not found');
        return expense;
    }

    async getAllExpenses(query: ExpenseQueryDto, user: User) {
        if (user.role === RoleEnum.USER) {
            const currentUser = await this.prismaService.user.findUnique({
                where: { id: user.id },
            });
            if (!currentUser) throw new NotFoundException('User not found');
            query.inventoryId = currentUser.inventoryId;
        }
        const expenses = await this.expenseRepo.getAllExpenses(query);
        const totalAmountSinceLastReport =
            await this.expenseRepo.getTotalAmountSinceLastReport(query);
        return { data: expenses, totalAmountSinceLastReport };
    }

    async updateExpense(id: number, updateExpenseDto: UpdateExpenseDto) {
        const existingExpense = await this.expenseRepo.getExpenseById(id);
        if (!existingExpense) throw new NotFoundException('Expense not found');
        if (existingExpense.applied)
            throw new NotFoundException('Cannot update an applied expense');
        return this.expenseRepo.updateExpense(id, updateExpenseDto);
    }

    async deleteExpense(id: number) {
        const existingExpense = await this.expenseRepo.getExpenseById(id);
        if (!existingExpense) throw new NotFoundException('Expense not found');
        if (existingExpense.applied)
            throw new NotFoundException('Cannot delete an applied expense');
        return this.expenseRepo.deleteExpense(id);
    }
}
