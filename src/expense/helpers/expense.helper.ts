import { Injectable } from '@nestjs/common';

@Injectable()
export class ExpenseHelper {
    filterExpensesByTag(expenses: any[], tag: string) {
        return expenses.filter(expense => expense.tag === tag);
    }

    calculateTotalExpenses(expenses: any[]) {
        return expenses.reduce((total, expense) => total + expense.amount, 0);
    }
}