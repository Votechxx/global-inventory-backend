import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Prisma, RoleEnum } from '@prisma/client';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import { CreateInventoryDto } from '../dto/create-inventory.dto';

@Injectable()
export class InventoryRepo {
    constructor(private readonly prismaService: PrismaService) {}

    async getInventoryById(
        id: number,
        prisma: Prisma.TransactionClient = this.prismaService,
    ) {
        const inventory = await prisma.inventory.findUnique({
            where: { id },
        });
        if (!inventory) throw new NotFoundException('Inventory not found');
        return inventory;
    }

    async getInventoryByName(
        name: string,
        prisma: Prisma.TransactionClient = this.prismaService,
    ) {
        const inventory = await prisma.inventory.findFirst({
            where: { name },
        });
        return inventory;
    }

    async createInventory(
        data: CreateInventoryDto,
        prisma: Prisma.TransactionClient = this.prismaService,
    ) {
        const { name, initialBalance, description, location } = data;
        return prisma.inventory.create({
            data: {
                name,
                balance: initialBalance,
                description,
                location,
            },
        });
    }
}
