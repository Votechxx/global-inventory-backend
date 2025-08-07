import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';

@Injectable()
export class ProductRepo {
    constructor(private readonly prismaService: PrismaService) {}

    async getProductById(id: number) {
        const product = await this.prismaService.product.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                price: true,
                inventory: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                productUnits: {
                    select: {
                        id: true,
                        value: true,
                        quantity: true,
                    },
                },
            },
        });
        if (!product) throw new NotFoundException('Product not found');
        return product;
    }

    async getProductByName(name: string) {
        return this.prismaService.product.findFirst({
            where: { name },
            select: {
                id: true,
                name: true,
                price: true,
                inventory: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                productUnits: {
                    select: {
                        id: true,
                        value: true,
                        quantity: true,
                    },
                },
            },
        });
    }

    async createProduct(data: Prisma.ProductCreateInput) {
        const existingProduct = await this.getProductByName(data.name);
        if (existingProduct) throw new BadRequestException('Product name already exists');
        return this.prismaService.product.create({ data });
    }

    async updateProduct(id: number, data: Prisma.ProductUpdateInput) {
        const product = await this.getProductById(id);
        return this.prismaService.product.update({
            where: { id },
            data,
            select: {
                id: true,
                name: true,
                price: true,
                inventory: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                productUnits: {
                    select: {
                        id: true,
                        value: true,
                        quantity: true,
                    },
                },
            },
        });
    }

    async deleteProduct(id: number) {
        const product = await this.getProductById(id);
        return this.prismaService.product.delete({ where: { id } });
    }

    async getAllProducts() {
        return this.prismaService.product.findMany({
            select: {
                id: true,
                name: true,
                price: true,
                inventory: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                productUnits: {
                    select: {
                        id: true,
                        value: true,
                        quantity: true,
                    },
                },
            },
        });
    }
}