import { Module } from '@nestjs/common';
import { ShipmentService } from './shipment.service';
import { ShipmentController } from './shipment.controller';
import { ShipmentRepo } from './repo/shipment.repo';
import { ShipmentHelper } from './helpers/shipment.helper';
import { ExpenseService } from 'src/expense/expense.service';
import { ExpenseRepo } from 'src/expense/repo/expense.repo';
import { ExpenseHelper } from 'src/expense/helpers/expense.helper';
import { InventoryService } from 'src/inventory/inventory.service';
import { InventoryRepo } from 'src/inventory/repo/inventory.repo';
import { InventoryHelper } from 'src/inventory/helpers/inventory.helper';

@Module({
  providers: [
    ShipmentService, ShipmentRepo, ShipmentHelper, 
    ExpenseHelper, ExpenseRepo, ExpenseService,
    InventoryService,InventoryRepo,InventoryHelper
  ],
  controllers: [ShipmentController],
  exports: [
    ShipmentService, ShipmentRepo,
    ExpenseRepo,
    InventoryService,InventoryRepo
  ],
})
export class ShipmentModule {}
