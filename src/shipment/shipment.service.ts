import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import { CreateShipmentDto, ShipmentResponseDto } from './dto/shipment.dto';
import { User } from '@prisma/client';
import { ShipmentRepo } from './repo/shipment.repo';
import { ShipmentHelper } from './helpers/shipment.helper';
import { ExpenseService } from '../expense/expense.service';
import { UserCreateExpenseDto } from 'src/expense/dto/expense.dto';

@Injectable()
export class ShipmentService {
  constructor(
    private prismaService: PrismaService,
    private readonly shipmentRepo: ShipmentRepo,
    private readonly shipmentHelper: ShipmentHelper,
    private readonly expenseService: ExpenseService,
  ) {}

  async createShipment(createShipmentDto: CreateShipmentDto, user: User): Promise<ShipmentResponseDto> {
    if (createShipmentDto.expenses && user.role !== 'ADMIN') {
      throw new UnauthorizedException('Only admins can set expense details');
    }

    // Assuming inventoryId is managed by the user or context, e.g., from user's inventory
    const inventoryId = user.inventoryId; // Adjust this based on your logic
    if (!inventoryId) throw new NotFoundException('User has no associated inventory');

    const inventory = await this.prismaService.inventory.findUnique({
      where: { id: inventoryId },
    });
    if (!inventory) throw new NotFoundException('Inventory not found');

    let totalPrice = 0;
    let expenseId: number | undefined = createShipmentDto.expenseId;

    if (createShipmentDto.expenses?.length) {
      const expenseIds = [];
      for (const expense of createShipmentDto.expenses) {
        const createExpenseDto: UserCreateExpenseDto = {
            name: expense.name,
            amount: expense.amount,
            inventoryId: inventoryId,
            tag: 'GAS'
        };
        const newExpense = await this.expenseService.createExpense(createExpenseDto, user.id);
        expenseIds.push(newExpense.id);
        totalPrice += newExpense.amount;
      }
      // Use the first expense ID if multiple, or leave as provided
      expenseId = expenseId || expenseIds[0];
    } else if (expenseId) {
      const expense = await this.prismaService.expense.findUnique({
        where: { id: expenseId },
      });
      if (!expense) throw new NotFoundException('Expense not found');
      totalPrice += expense.amount;
    }

    const shipment = await this.shipmentRepo.createShipment({
      title: createShipmentDto.title,
      numberOfTrucks: createShipmentDto.numberOfTrucks,
      inventory: { connect: { id: inventoryId } }, 
      user: { connect: { id: user.id } },
      expense: expenseId ? { connect: { id: expenseId } } : undefined,
    });

    return this.shipmentHelper.mapToResponse(shipment, totalPrice);
  }

  async getShipment(id: number): Promise<ShipmentResponseDto> {
    const shipment = await this.shipmentRepo.getShipmentById(id);
    if (!shipment) throw new NotFoundException('Shipment not found');
    const totalPrice = shipment.expense ? shipment.expense.amount : 0;
    return this.shipmentHelper.mapToResponse(shipment, totalPrice);
  }

  async getShipmentsCount(): Promise<number> {
    return this.prismaService.shipment.count();
  }

  async getAllShipments(page: number, limit: number): Promise<{ shipments: ShipmentResponseDto[]; total: number }> {
    const skip = (page - 1) * limit;
    const [shipments, total] = await this.prismaService.$transaction([
      this.prismaService.shipment.findMany({
        skip,
        take: limit,
        include: { expense: true, user: true, inventory: true },
      }),
      this.prismaService.shipment.count(),
    ]);
    const response = shipments.map(shipment =>
      this.shipmentHelper.mapToResponse(shipment, shipment.expense ? shipment.expense.amount : 0),
    );
    return { shipments: response, total };
  }
}