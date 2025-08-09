import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import { Prisma } from '@prisma/client';

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

    async createExpense(data: Prisma.ExpenseCreateInput) {
        return this.prismaService.expense.create({ data });
    }

    async updateExpense(id: number, data: Prisma.ExpenseUpdateInput) {
        const expense = await this.getExpenseById(id);
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
        const expense = await this.getExpenseById(id);
        return this.prismaService.expense.delete({ where: { id } });
    }

    async getAllExpenses(inventoryId?: number) {
        return this.prismaService.expense.findMany({
            where: inventoryId ? { inventoryId } : {},
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
}