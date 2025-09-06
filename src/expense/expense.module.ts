import { forwardRef, Module } from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { ExpenseController } from './expense.controller';
import { ExpenseRepo } from './repo/expense.repo';
import { ExpenseHelper } from './helpers/expense.helper';
import { UserModule } from 'src/core/user/user.module';
import { ReportModule } from 'src/report/report.module';

@Module({
    imports: [UserModule, forwardRef(() => ReportModule)],
    providers: [ExpenseService, ExpenseRepo, ExpenseHelper],
    controllers: [ExpenseController],
    exports: [ExpenseService, ExpenseRepo],
})
export class ExpenseModule {}

