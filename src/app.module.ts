import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/modules/prisma/prisma.module';
import { EmailModule } from './common/modules/email/email.module';
import { OtpModule } from './common/modules/otp/otp.module';
import { UPLOAD_PATH } from './common/constants/path.constant';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ScheduleModule } from '@nestjs/schedule';
import { UserRepo } from './core/user/repo/user.repo';
import { FileModule } from './file/file.module';
import { InventoryModule } from './inventory/inventory.module';
import { ProductModule } from './product/product.module';
import { ProductController } from './product/product.controller';
import { ExpenseModule } from './expense/expense.module';
import { ReportModule } from './report/report.module';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        // 1. Highest priority: Uploads
        ServeStaticModule.forRoot({
            rootPath: UPLOAD_PATH,
            serveRoot: '/static-uploads',
        }),
        PrismaModule,
        ConfigModule.forRoot({ isGlobal: true }),
        CoreModule,
        EmailModule,
        OtpModule,
        FileModule,
        InventoryModule,
        ProductModule,
        ExpenseModule,
        ReportModule,
    ],
    controllers: [ProductController],
    providers: [UserRepo],
})
export class AppModule {}
