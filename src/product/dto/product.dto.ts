import {
    IsNotEmpty,
    IsString,
    IsNumber,
    IsArray,
    IsOptional,
    ValidateNested,
    IsInt,
    ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';

export class CreateProductUnitDto {
    @ApiProperty({
        description:
            'The value of the product unit (number of units per batch)',
        required: true,
    })
    @IsNotEmpty()
    @IsInt()
    value: number;

    @ApiProperty({
        description: 'The quantity of batches available',
        required: false,
        default: 0,
    })
    @IsOptional()
    @IsInt()
    quantity?: number;
}

export class CreateProductDto {
    @ApiProperty({
        description: 'The name of the product',
        required: true,
        example: 'Product A',
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({
        description: 'The price per unit of the product',
        required: true,
        example: 10.5,
    })
    @IsNotEmpty()
    @IsNumber()
    price: number;

    @ApiProperty({
        description: 'The product units (batches) with value and quantity',
        required: false,
        type: [CreateProductUnitDto],
        example: [{ value: 10, quantity: 5 }],
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @ArrayMinSize(1)
    @Type(() => CreateProductUnitDto)
    productUnits?: CreateProductUnitDto[];

    @ApiProperty({
        description: 'The ID of the inventory',
        required: true,
        example: 1,
    })
    @IsNotEmpty()
    @IsInt()
    inventoryId: number;
}

export class UpdateProductDto extends PartialType(
    OmitType(CreateProductDto, ['inventoryId']),
) {}

export class AddToInventoryDto {
    @ApiProperty({
        description: 'The ID of the inventory',
        required: true,
        example: 1,
    })
    @IsNotEmpty()
    @IsInt()
    inventoryId: number;

    @ApiProperty({
        description: 'The number of batches to add to the inventory',
        required: true,
        example: 2,
    })
    @IsNotEmpty()
    @IsInt()
    quantity: number;
}
