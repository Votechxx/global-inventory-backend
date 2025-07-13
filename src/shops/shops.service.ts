import { Injectable } from '@nestjs/common';
import { CreateShopDto  , UpdateShopDto } from './dto/shop.dto';
import { ShopRepository } from './repo/shop.repo';

@Injectable()
export class ShopsService {
  constructor(private readonly shopRepository: ShopRepository) {}
  create(createShopDto: CreateShopDto) {
    return this.shopRepository.createShop(createShopDto);
  }

  findAll() {
    return this.shopRepository.findAllShops();
  }

  findOne(id: number) {
    return this.shopRepository.findShopById(id);
  }

  update(id: number, updateShopDto: UpdateShopDto) {
    return this.shopRepository.updateShop(id, updateShopDto);
  }
    remove(id: number) {
      return this.shopRepository.deleteShop(id);
    }
  }