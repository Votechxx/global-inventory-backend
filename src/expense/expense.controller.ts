import { Controller, Get, Post, Body, Param, Patch, Delete, Query } from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto, UpdateExpenseDto } from './dto/expense.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../core/auth/guard/roles.guard';
import { Roles } from '../core/auth/decorator/roles.decorator';
import { RoleEnum } from '@prisma/client';

@ApiTags('Expenses')
@Controller('expenses')
export class ExpenseController {
    constructor(private readonly expenseService: ExpenseService) {}

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.ADMIN)
    @ApiBearerAuth('default')
    @ApiOperation({
        summary: 'Create a new expense',
        description: 'Create a new expense for a specific inventory by admin',
    })
    @Post()
    create(@Body() createExpenseDto: CreateExpenseDto) {
        return this.expenseService.createExpense(createExpenseDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('default')
    @ApiOperation({
        summary: 'Get expense details',
        description: 'Get details of a specific expense',
    })
    @Get(':id')
    getExpense(@Param('id') id: string) {
        return this.expenseService.getExpense(+id);
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('default')
    @ApiOperation({
        summary: 'Get all expenses',
        description: 'Get list of expenses with optional inventory filter',
    })
    @Get()
    getAllExpenses(@Query('inventoryId') inventoryId?: string) {
        return this.expenseService.getAllExpenses(inventoryId ? +inventoryId : undefined);
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.ADMIN)
    @ApiBearerAuth('default')
    @ApiOperation({
        summary: 'Update expense details',
        description: 'Update details of an existing expense by admin',
    })
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateExpenseDto: UpdateExpenseDto) {
        return this.expenseService.updateExpense(+id, updateExpenseDto);
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.ADMIN)
    @ApiBearerAuth('default')
    @ApiOperation({
        summary: 'Delete an expense',
        description: 'Delete an expense by admin',
    })
    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.expenseService.deleteExpense(+id);
    }
}