import { forwardRef, Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { ReportProductRepo } from './repo/report-product.repo';
import { ReportRepo } from './repo/report.repo';
import { UserModule } from 'src/core/user/user.module';
import { InventoryModule } from 'src/inventory/inventory.module';
import { ProductModule } from 'src/product/product.module';
import { ExpenseModule } from 'src/expense/expense.module';

@Module({
    imports: [
        forwardRef(() => ExpenseModule),
        UserModule,
        forwardRef(() => InventoryModule),
        forwardRef(() => ProductModule),
    ],
    controllers: [ReportController],
    providers: [ReportService, ReportProductRepo, ReportRepo],
    exports: [ReportProductRepo, ReportRepo],
})
export class ReportModule {}
