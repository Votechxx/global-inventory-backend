import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { InventoryModule } from './inventory/inventory.module';

@Module({
    imports: [AuthModule, UserModule, InventoryModule],
    controllers: [],
    providers: [],
})
export class CoreModule {}
