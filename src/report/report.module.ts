import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { UserModule } from 'src/core/user/user.module';
import { ReportRepo } from './repo/report.dto';
import { InventoryModule } from 'src/inventory/inventory.module';
import { ProductModule } from 'src/product/product.module';

@Module({
    imports: [UserModule, InventoryModule, ProductModule],
    controllers: [ReportController],
    providers: [ReportService, ReportRepo],
    exports: [ReportRepo],
})
export class ReportModule {}
