import { IsNotEmpty, IsString, IsNumber, IsArray, IsOptional, ValidateNested, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateProductUnitDto {
    @ApiProperty({
        description: 'The value of the product unit (number of units per batch)',
        required: false,
        default: 1,
    })
    @IsOptional()
    @IsInt()
    value?: number;

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
    @Type(() => CreateProductUnitDto)
    productUnits?: CreateProductUnitDto[];
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}

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