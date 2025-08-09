import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import { CreateExpenseDto, UpdateExpenseDto } from './dto/expense.dto';
import { ExpenseRepo } from './repo/expense.repo';
import { ExpenseHelper } from './helpers/expense.helper';

@Injectable()
export class ExpenseService {
    constructor(
        private prismaService: PrismaService,
        private readonly expenseRepo: ExpenseRepo,
        private readonly expenseHelper: ExpenseHelper,
    ) {}

    async createExpense(createExpenseDto: CreateExpenseDto) {
        const inventory = await this.prismaService.inventory.findUnique({ where: { id: createExpenseDto.inventoryId } });
        if (!inventory) throw new NotFoundException('Inventory not found');

        if (inventory.balance < createExpenseDto.amount) {
            throw new BadRequestException('Insufficient balance in inventory');
        }

        const data: any = {
            name: createExpenseDto.name,
            amount: createExpenseDto.amount,
            description: createExpenseDto.description,
            tag: createExpenseDto.tag,
            inventory: { connect: { id: createExpenseDto.inventoryId } },
        };

        await this.prismaService.inventory.update({
            where: { id: createExpenseDto.inventoryId },
            data: { balance: { decrement: createExpenseDto.amount } },
        });

        const expense = await this.expenseRepo.createExpense(data);
        const totalExpenses = this.expenseHelper.calculateTotalExpenses([expense]);
        console.log(`Total expenses after creation: ${totalExpenses}`);
        return expense;
    }

    async getExpense(id: number) {
        return this.expenseRepo.getExpenseById(id);
    }

    async getAllExpenses(inventoryId?: number) {
        const expenses = await this.expenseRepo.getAllExpenses(inventoryId);
        return expenses;
    }

    async updateExpense(id: number, updateExpenseDto: UpdateExpenseDto) {
        const existingExpense = await this.expenseRepo.getExpenseById(id);
        if (!existingExpense) throw new NotFoundException('Expense not found');

        const data: any = {
            name: updateExpenseDto.name,
            amount: updateExpenseDto.amount,
            description: updateExpenseDto.description,
            tag: updateExpenseDto.tag,
        };

        if (updateExpenseDto.amount && updateExpenseDto.amount !== existingExpense.amount) {
            const difference = updateExpenseDto.amount - existingExpense.amount;
            const inventory = await this.prismaService.inventory.findUnique({ where: { id: existingExpense.inventory.id } });
            if (inventory.balance + difference < 0) {
                throw new BadRequestException('Insufficient balance in inventory');
            }
            await this.prismaService.inventory.update({
                where: { id: existingExpense.inventory.id },
                data: { balance: { decrement: difference } },
            });
        }

        return this.expenseRepo.updateExpense(id, data);
    }

    async deleteExpense(id: number) {
        const expense = await this.expenseRepo.getExpenseById(id);
        await this.prismaService.inventory.update({
            where: { id: expense.inventory.id },
            data: { balance: { increment: expense.amount } },
        });
        return this.expenseRepo.deleteExpense(id);
    }
}