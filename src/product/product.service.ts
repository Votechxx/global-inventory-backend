import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import { CreateProductDto, UpdateProductDto, AddToInventoryDto } from './dto/product.dto';
import { ProductRepo } from './repo/product.repo';

@Injectable()
export class ProductService {
    constructor(
        private prismaService: PrismaService,
        private readonly productRepo: ProductRepo,
    ) {}

    async createProduct(createProductDto: CreateProductDto) {
        return this.productRepo.createProduct({
            name: createProductDto.name,
            price: createProductDto.price,
            productUnits: createProductDto.productUnits ? { create: createProductDto.productUnits } : undefined,
        });
    }

    async getProduct(id: number) {
        return this.productRepo.getProductById(id);
    }

    async updateProduct(id: number, updateProductDto: UpdateProductDto) {
        return this.productRepo.updateProduct(id, {
            name: updateProductDto.name,
            price: updateProductDto.price,
            productUnits: updateProductDto.productUnits
                ? { deleteMany: {}, create: updateProductDto.productUnits }
                : undefined,
        });
    }

    async deleteProduct(id: number) {
        return this.productRepo.deleteProduct(id);
    }

    async addToInventory(id: number, addToInventoryDto: AddToInventoryDto) {
        const product = await this.productRepo.getProductById(id);
        if (!product) throw new NotFoundException('Product not found');

        const inventory = await this.prismaService.inventory.findUnique({ where: { id: addToInventoryDto.inventoryId } });
        if (!inventory) throw new NotFoundException('Inventory not found');

        return this.prismaService.product.update({
            where: { id },
            data: {
                inventories: { connect: { id: addToInventoryDto.inventoryId } },
            },
        });
    }
}