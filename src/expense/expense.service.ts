import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import {
    CreateExpenseDto,
    ExpenseQueryDto,
    UpdateExpenseDto,
    UserCreateExpenseDto,
} from './dto/expense.dto';
import { ExpenseRepo } from './repo/expense.repo';
import { ExpenseHelper } from './helpers/expense.helper';

@Injectable()
export class ExpenseService {
    constructor(
        private prismaService: PrismaService,
        private readonly expenseRepo: ExpenseRepo,
        private readonly expenseHelper: ExpenseHelper,
    ) {}

    async createExpense(
        userCreateExpenseDto: UserCreateExpenseDto,
        userId: number,
    ) {
        const inventory = await this.prismaService.inventory.findUnique({
            where: { id: userCreateExpenseDto.inventoryId },
        });
        if (!inventory) throw new NotFoundException('Inventory not found');
        const createExpenseDto: CreateExpenseDto = {
            ...userCreateExpenseDto,
            userId,
        };
        const expense = await this.expenseRepo.createExpense(createExpenseDto);
        return expense;
    }

    async getExpense(id: number) {
        const expense = await this.expenseRepo.getExpenseById(id);
        if (!expense) throw new NotFoundException('Expense not found');
        return expense;
    }

    async getAllExpenses(query: ExpenseQueryDto) {
        const expenses = await this.expenseRepo.getAllExpenses(query);
        return expenses;
    }

    async updateExpense(id: number, updateExpenseDto: UpdateExpenseDto) {
        const existingExpense = await this.expenseRepo.getExpenseById(id);
        if (!existingExpense) throw new NotFoundException('Expense not found');
        // TODO when we add جرد then we should add validation here that we don't update the expense
        return this.expenseRepo.updateExpense(id, updateExpenseDto);
    }

    async deleteExpense(id: number) {
        // TODO here also when we add جرد we should add validation that we don't delete the expense
        const existingExpense = await this.expenseRepo.getExpenseById(id);
        if (!existingExpense) throw new NotFoundException('Expense not found');
        return this.expenseRepo.deleteExpense(id);
    }
}
