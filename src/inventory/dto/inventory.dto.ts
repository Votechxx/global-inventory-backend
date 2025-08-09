import { IsNotEmpty, IsString, IsOptional, IsArray, ValidateNested, IsInt, IsEnum, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateInventoryDto {
    @ApiProperty({ description: 'The name of the inventory', required: true, example: 'Main Warehouse' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ description: 'The description of the inventory', required: false, example: 'Central storage' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ description: 'The location of the inventory', required: false, example: 'Cairo' })
    @IsOptional()
    @IsString()
    location?: string;

    @ApiProperty({ description: 'The initial balance of the inventory', required: false, example: 1000 })
    @IsOptional()
    @IsNumber()
    balance?: number;
}

export class UpdateInventoryDto extends PartialType(CreateInventoryDto) {}

export class AddWorkerToInventoryDto {
    @ApiProperty({
        description: 'The ID of the worker to add',
        required: true,
    })
    @IsNotEmpty()
    @IsInt()
    workerId: number;
}

export class MoveWorkerDto {
    @ApiProperty({
        description: 'The ID of the worker to move',
        required: true,
    })
    @IsNotEmpty()
    @IsInt()
    workerId: number;

    @ApiProperty({
        description: 'The ID of the target inventory',
        required: true,
    })
    @IsNotEmpty()
    @IsInt()
    targetInventoryId: number;
}

export enum SortOrder {
    ASC = 'asc',  // oldest
    DESC = 'desc', // latest
}

export class InventoryQueryDto {
    @ApiProperty({
        description: 'Filter by inventory name',
        required: false,
    })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({
        description: 'Page number',
        required: false,
        default: 1,
    })
    @IsOptional()
    page?: number;

    @ApiProperty({
        description: 'Items per page',
        required: false,
        default: 20,
    })
    @IsOptional()
    limit?: number;

    @ApiProperty({
        description: 'Sort order for workers by createdAt (asc for oldest, desc for newest)',
        required: false,
        enum: SortOrder,
        default: SortOrder.DESC,
    })
    @IsOptional()
    @IsEnum(SortOrder)
    sortOrder?: SortOrder;
}