import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, RoleEnum } from '@prisma/client';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';

@Injectable()
export class InventoryRepo {
  constructor(private readonly prismaService: PrismaService) {}

  async getInventoryById(id: number, prisma: PrismaService = this.prismaService) {
    const inventory = await prisma.inventory.findUnique({
      where: { id },
    });
    if (!inventory) throw new NotFoundException('Inventory not found');
    return inventory;
  }

  async getInventoryByName(name: string, prisma: PrismaService = this.prismaService) {
    const inventory = await prisma.inventory.findFirst({
        where: { name },
    });
    return inventory;
  }

  async createInventory(data: Prisma.InventoryCreateInput, prisma: PrismaService = this.prismaService) {
    const existingInventory = await this.getInventoryByName(data.name);
    if (existingInventory) throw new BadRequestException('Inventory name already exists');

    return prisma.inventory.create({
      data,
    });
  }
}