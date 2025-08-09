import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductHelper {
    calculateTotalUnits(productUnits: { value: number; quantity: number }[]) {
        return productUnits.reduce((total, unit) => total + (unit.value * unit.quantity), 0);
    }

    validateProductUnits(productUnits: { value?: number; quantity?: number }[]) {
        if (!productUnits) return true;
        return productUnits.every(unit => unit.value !== undefined && unit.quantity !== undefined && unit.value >= 0 && unit.quantity >= 0);
    }
}