import { IsNotEmpty, IsString, IsNumber, IsArray, IsOptional, ValidateNested, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateProductUnitDto {
    @ApiProperty({
        description: 'The value of the product unit (number of units)',
        required: false,
        default: 1,
    })
    @IsOptional()
    @IsInt()
    value?: number;
}

export class CreateProductDto {
    @ApiProperty({
        description: 'The name of the product',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({
        description: 'The price of the product',
        required: true,
    })
    @IsNotEmpty()
    @IsNumber()
    price: number;

    @ApiProperty({
        description: 'The product units',
        required: false,
        type: [CreateProductUnitDto],
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
    })
    @IsNotEmpty()
    @IsInt()
    inventoryId: number;

    @ApiProperty({
        description: 'The quantity to add to the inventory',
        required: true,
    })
    @IsNotEmpty()
    @IsNumber()
    quantity: number;
}