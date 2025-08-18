import { Module } from '@nestjs/common';
import { ShipmentService } from './shipment.service';
import { ShipmentController } from './shipment.controller';
import { ShipmentRepo } from './repo/shipment.repo';
import { ShipmentHelper } from './helpers/shipment.helper';
import { ExpenseService } from 'src/expense/expense.service';
import { ExpenseRepo } from 'src/expense/repo/expense.repo';
import { ExpenseHelper } from 'src/expense/helpers/expense.helper';

@Module({
  providers: [ShipmentService, ShipmentRepo, ShipmentHelper, ExpenseHelper, ExpenseRepo, ExpenseService],
  controllers: [ShipmentController],
  exports: [ShipmentService, ShipmentRepo,ExpenseRepo],
})
export class ShipmentModule {}
