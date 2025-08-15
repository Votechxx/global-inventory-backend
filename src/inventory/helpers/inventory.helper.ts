import { Injectable } from '@nestjs/common';

@Injectable()
export class InventoryHelper {
  suggestInventoryName(baseName: string): string {
    // suggest a unique name
    return `${baseName}-${Math.floor(Math.random() * 1000)}`;
  }
async calculateTotalValue(products: { productId: number; quantity: number }[], prismaService: any) {
        let totalValue = 0;
        for (const product of products) {
            const dbProduct = await prismaService.product.findUnique({ where: { id: product.productId } });
            if (dbProduct) {
                totalValue += dbProduct.price * product.quantity;
            }
        }
        return totalValue;
    }
  }