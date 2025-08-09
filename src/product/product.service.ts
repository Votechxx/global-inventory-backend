import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import {
    CreateProductDto,
    UpdateProductDto,
    AddToInventoryDto,
} from './dto/product.dto';
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
            inventory: createProductDto.inventoryId
                ? { connect: { id: createProductDto.inventoryId } }
                : undefined, // استخدام connect للربط
            productUnits: createProductDto.productUnits
                ? {
                      create: createProductDto.productUnits.map((unit) => ({
                          quantity: unit.quantity,
                          value: unit.value, // Ensure 'value' is provided
                      })),
                  }
                : undefined,
        });
    }

    async getProduct(id: number) {
        const product = await this.productRepo.getProductById(id);
        if (!product) throw new NotFoundException('Product not found');

        if (product.productUnits && Array.isArray(product.productUnits)) {
            product.productUnits = product.productUnits.map((unit) => ({
                ...unit,
                totalUnits: unit.value * unit.quantity,
            }));
        }
        return product;
    }

    async getAllProducts() {
        const products = await this.productRepo.getAllProducts();
        return products.map((product) => {
            if (product.productUnits && Array.isArray(product.productUnits)) {
                product.productUnits = product.productUnits.map((unit) => ({
                    ...unit,
                    totalUnits: unit.value * unit.quantity,
                }));
            }
            return product;
        });
    }

    async updateProduct(id: number, updateProductDto: UpdateProductDto) {
        const existingProduct = await this.productRepo.getProductById(id);
        if (!existingProduct) throw new NotFoundException('Product not found');

        return this.productRepo.updateProduct(id, {
            name: updateProductDto.name,
            price: updateProductDto.price,
            inventory: updateProductDto.inventoryId
                ? { connect: { id: updateProductDto.inventoryId } }
                : undefined, // استخدام connect
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

        const inventory = await this.prismaService.inventory.findUnique({
            where: { id: addToInventoryDto.inventoryId },
        });
        if (!inventory) throw new NotFoundException('Inventory not found');

        const updatedProduct = await this.prismaService.product.update({
            where: { id },
            data: {
                inventory: { connect: { id: addToInventoryDto.inventoryId } }, // ربط بمخزن
                productUnits: {
                    updateMany: {
                        where: {},
                        data: {
                            quantity: { increment: addToInventoryDto.quantity },
                        },
                    },
                },
            },
            select: {
                id: true,
                name: true,
                price: true,
                inventory: {
                    select: { id: true, name: true },
                },
                productUnits: {
                    select: { id: true, value: true, quantity: true },
                },
            },
        });

        if (
            updatedProduct.productUnits &&
            Array.isArray(updatedProduct.productUnits)
        ) {
            updatedProduct.productUnits = updatedProduct.productUnits.map(
                (unit) => ({
                    ...unit,
                    totalUnits: unit.value * unit.quantity,
                }),
            );
        }
        return updatedProduct;
    }
}
