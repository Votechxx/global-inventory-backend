import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateInventoryDto } from './create-inventory.dto';

export class UpdateInventoryDto extends PartialType(CreateInventoryDto) {
    @ApiProperty({
        description: 'The updated name of the inventory',
        required: false,
    })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({
        description: 'The updated balance of the inventory',
        required: false,
        example: 1500.0,
    })
    @IsOptional()
    @IsNumber()
    initialBalance?: number;

    @ApiProperty({
        description: 'Optional description of the inventory',
        required: false,
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({
        description: 'Optional location of the inventory',
        required: false,
    })
    @IsString()
    @IsOptional()
    location?: string;
}
