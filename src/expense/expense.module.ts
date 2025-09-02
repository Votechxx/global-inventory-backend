import { Module } from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { ExpenseController } from './expense.controller';
import { ExpenseRepo } from './repo/expense.repo';
import { ExpenseHelper } from './helpers/expense.helper';
import { UserModule } from 'src/core/user/user.module';

@Module({
    imports: [UserModule],
    providers: [ExpenseService, ExpenseRepo, ExpenseHelper],
    controllers: [ExpenseController],
    exports: [ExpenseService, ExpenseRepo],
})
export class ExpenseModule {}
