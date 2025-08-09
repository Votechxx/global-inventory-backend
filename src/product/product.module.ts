import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { ProductRepo } from './repo/product.repo';

@Module({
  providers: [ProductService,ProductRepo],
  controllers: [ProductController],
  exports: [ProductService,ProductRepo]
})
export class ProductModule {}
