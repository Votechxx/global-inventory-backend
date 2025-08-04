import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { InventoryRepo } from './repo/inventory.repo';
import { InventoryHelper } from './helpers/inventory.helper';

@Module({
  controllers: [InventoryController],
  providers: [InventoryService, InventoryRepo, InventoryHelper],
  exports: [InventoryService, InventoryRepo],
})
export class InventoryModule {}
