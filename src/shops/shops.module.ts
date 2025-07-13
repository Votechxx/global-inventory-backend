import { Module } from '@nestjs/common';
import { ShopsService } from './shops.service';
import { ShopsController } from './shops.controller';
import { ShopRepository } from './repo/shop.repo';

@Module({
  controllers: [ShopsController],
  providers: [ShopsService , ShopRepository],
})
export class ShopsModule {}
