import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';

@Injectable()
export class ProductRepo {
    constructor(private readonly prismaService: PrismaService) {}

    async getProductById(id: number) {
        const product = await this.prismaService.product.findUnique({ where: { id } });
        if (!product) throw new NotFoundException('Product not found');
        return product;
    }

    async getProductByName(name: string) {
        return this.prismaService.product.findFirst({ where: { name } });
    }

    async createProduct(data: Prisma.ProductCreateInput) {
        const existingProduct = await this.getProductByName(data.name);
        if (existingProduct) throw new BadRequestException('Product name already exists');
        return this.prismaService.product.create({ data });
    }

    async updateProduct(id: number, data: Prisma.ProductUpdateInput) {
        const product = await this.getProductById(id);
        return this.prismaService.product.update({ where: { id }, data });
    }

    async deleteProduct(id: number) {
        const product = await this.getProductById(id);
        return this.prismaService.product.delete({ where: { id } });
    }
}