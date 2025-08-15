import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { InventoryRepo } from './repo/inventory.repo';
import { InventoryHelper } from './helpers/inventory.helper';
import { LocalService } from 'src/file/local/local.service';

@Module({
  controllers: [InventoryController],
  providers: [InventoryService, InventoryRepo, InventoryHelper,LocalService],
  exports: [InventoryService, InventoryRepo,LocalService],
})
export class InventoryModule {}
