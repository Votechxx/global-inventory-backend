import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { ProductRepo } from './repo/product.repo';
import { ProductUnitRepo } from './repo/product-unit.repo';

@Module({
    providers: [ProductService, ProductRepo, ProductUnitRepo],
    controllers: [ProductController],
    exports: [ProductService, ProductRepo, ProductUnitRepo],
})
export class ProductModule {}
