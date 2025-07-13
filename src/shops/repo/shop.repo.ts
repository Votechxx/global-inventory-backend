// this is the repostory layer for the shop module
//I AM USING PRISMA
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import { PrismaClient, shop ,Prisma} from '@prisma/client';
import { Injectable } from '@nestjs/common';
@Injectable()
export class ShopRepository {
    constructor(private readonly prisma: PrismaService) {}

    async createShop(
        data: Prisma.shopCreateInput,
        prisma: PrismaClient = this.prisma,
    ): Promise<shop> {
        return await prisma.shop.create({
            data,
        });
    }

    async findAllShops(prisma: PrismaClient = this.prisma , filters:Prisma.shopWhereInput = {}): Promise<shop[]> {
        return prisma.shop.findMany(
            {
                where: filters,
            },
        );
    }

    async findShopById(
        id: number,
        prisma: PrismaClient = this.prisma,
    ): Promise<shop | null> {
        return prisma.shop.findUnique({
            where: { id },
        });
    }

    async updateShop(
        id: number,
        data: Prisma.shopUpdateInput,
        prisma: PrismaClient = this.prisma,
    ): Promise<shop> {
        return prisma.shop.update({
            where: { id },
            data,
        });
    }

    async deleteShop(
        id: number,
        prisma: PrismaClient = this.prisma,
    ): Promise<shop> {
        return prisma.shop.delete({
            where: { id },
        });
    }
}
