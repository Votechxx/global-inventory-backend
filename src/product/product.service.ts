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
        const product = await this.productRepo.getProductById(id);
        // value and quantity are multiplied to get total units
        product.productUnits = product.productUnits.map(unit => ({
            ...unit,
            totalUnits: unit.value * unit.quantity,
        }));
        return product;
    }

    async getAllProducts() {
        const products = await this.productRepo.getAllProducts();
        return products.map(product => ({
            ...product,
            productUnits: product.productUnits.map(unit => ({
                ...unit,
                totalUnits: unit.value * unit.quantity,
            })),
        }));
    }

    async updateProduct(id: number, updateProductDto: UpdateProductDto) {
        const existingProduct = await this.productRepo.getProductById(id);
        if (!existingProduct) throw new NotFoundException('Product not found');

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

        // update quantity
        const updatedProduct = await this.prismaService.product.update({
            where: { id },
            data: {
                inventories: { connect: { id: addToInventoryDto.inventoryId } },
                productUnits: {
                    updateMany: {
                        where: {},
                        data: { quantity: { increment: addToInventoryDto.quantity } },
                    },
                },
            },
            include: { productUnits: true, inventories: true },
        });

        // calculate total quantity
        updatedProduct.productUnits = updatedProduct.productUnits.map(unit => ({
            ...unit,
            totalUnits: unit.value * unit.quantity,
        }));
        return updatedProduct;
    }
}