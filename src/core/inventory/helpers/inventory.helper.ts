import { Injectable } from '@nestjs/common';

@Injectable()
export class InventoryHelper {
  suggestInventoryName(baseName: string): string {
    // suggest a unique name
    return `${baseName}-${Math.floor(Math.random() * 1000)}`;
  }
}