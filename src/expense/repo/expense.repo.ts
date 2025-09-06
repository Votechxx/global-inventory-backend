import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
    CreateExpenseDto,
    ExpenseQueryDto,
    UpdateExpenseDto,
} from '../dto/expense.dto';

@Injectable()
export class ExpenseRepo {
    constructor(private readonly prismaService: PrismaService) {}

    async getExpenseById(id: number) {
        const expense = await this.prismaService.expense.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                amount: true,
                description: true,
                tag: true,
                inventory: { select: { id: true, name: true } },
            },
        });
        if (!expense) throw new NotFoundException('Expense not found');
        return expense;
    }

    async createExpense(
        data: CreateExpenseDto,
        prisma: Prisma.TransactionClient = this.prismaService,
    ) {
        return prisma.expense.create({ data });
    }

    async updateExpense(id: number, data: UpdateExpenseDto) {
        return this.prismaService.expense.update({
            where: { id },
            data,
            select: {
                id: true,
                name: true,
                amount: true,
                description: true,
                tag: true,
                inventory: { select: { id: true, name: true } },
            },
        });
    }

    async deleteExpense(id: number) {
        return this.prismaService.expense.delete({ where: { id } });
    }

    async getAllExpenses(query: ExpenseQueryDto) {
        const { page = 1, limit: take = 10, name, ...filter } = query;
        const skip = (page - 1) * take;

        const where: Prisma.ExpenseWhereInput = {
            ...filter,
            name: name ? { contains: name, mode: 'insensitive' } : undefined,
        };

        return this.prismaService.expense.findMany({
            where,
            take,
            skip,
            select: {
                id: true,
                name: true,
                amount: true,
                description: true,
                tag: true,
                inventory: { select: { id: true, name: true } },
            },
        });
    }

    async getAllNewExpensesForInventory(inventoryId: number) {
        return this.prismaService.expense.findMany({
            where: { reportId: null, inventoryId },
            select: {
                id: true,
                name: true,
                amount: true,
                description: true,
                tag: true,
            },
        });
    }

    async markExpensesToReport(
        expenseIds: number[],
        reportId: number,
        prisma: Prisma.TransactionClient = this.prismaService,
    ) {
        return prisma.expense.updateMany({
            where: { id: { in: expenseIds } },
            data: { reportId },
        });
    }
}
