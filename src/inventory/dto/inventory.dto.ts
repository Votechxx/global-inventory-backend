import { IsNotEmpty, IsString, IsOptional, IsArray, ValidateNested, IsInt, IsEnum, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { StatusReportEnum } from '@prisma/client';

export class CreateInventoryDto {
    @ApiProperty({ description: 'The name of the inventory', required: true })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ description: 'The description of the inventory', required: false })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ description: 'The location of the inventory', required: false })
    @IsOptional()
    @IsString()
    location?: string;

    @ApiProperty({ description: 'List of products with quantities', required: true })
    @IsNotEmpty()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductQuantity)
    products: ProductQuantity[];

    @ApiProperty({ description: 'Current cash on hand', required: true })
    @IsNotEmpty()
    @IsNumber()
    cashOnHand: number;
}

class ProductQuantity {
    @ApiProperty({ description: 'The ID of the product', required: true })
    @IsNotEmpty()
    @IsInt()
    productId: number;

    @ApiProperty({ description: 'The quantity of the product', required: true })
    @IsNotEmpty()
    @IsNumber()
    quantity: number;
}

export class UpdateInventoryDto {
    @ApiProperty({ description: 'The name of the inventory', required: false })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ description: 'The description of the inventory', required: false })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ description: 'The location of the inventory', required: false })
    @IsOptional()
    @IsString()
    location?: string;

    @ApiProperty({ description: 'List of products with quantities', required: false })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductQuantity)
    products?: ProductQuantity[];

    @ApiProperty({ description: 'Current cash on hand', required: false })
    @IsOptional()
    @IsNumber()
    cashOnHand?: number;

    @ApiProperty({ description: 'The deposit amount', required: false })
    @IsOptional()
    @IsNumber()
    depositAmount?: number;

    @ApiProperty({ description: 'The file ID for deposit receipt', required: false })
    @IsOptional()
    @IsInt()
    fileId?: number;
}

export class AddWorkerToInventoryDto {
    @ApiProperty({ description: 'The ID of the worker to add', required: true })
    @IsNotEmpty()
    @IsInt()
    workerId: number;
}

export enum SortOrder {
    ASC = 'asc',
    DESC = 'desc',
}

export class InventoryQueryDto {
    @ApiProperty({ description: 'Filter by inventory name', required: false })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ description: 'Page number', required: false })
    @IsOptional()
    page?: number;

    @ApiProperty({ description: 'Items per page', required: false })
    @IsOptional()
    limit?: number;

    @ApiProperty({ description: 'Sort order for workers by createdAt', required: false })
    @IsOptional()
    @IsEnum(SortOrder)
    sortOrder?: SortOrder;
}

export class SubmitDailyReportDto {
    @ApiProperty({ description: 'Current stock data', required: true })
    @IsNotEmpty()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => StockItem)
    stock: StockItem[];

    @ApiProperty({ description: 'Cash on hand', required: true })
    @IsNotEmpty()
    @IsNumber()
    cashOnHand: number;

    @ApiProperty({ description: 'Amount to deposit in bank', required: true })
    @IsNotEmpty()
    @IsNumber()
    bankDeposit: number;

    @ApiProperty({ description: 'The file ID for deposit receipt', required: false })
    @IsOptional()
    @IsInt()
    fileId?: number;
}

class StockItem {
    @ApiProperty({ description: 'The ID of the product', required: true })
    @IsNotEmpty()
    @IsInt()
    productId: number;

    @ApiProperty({ description: 'The current stock', required: true })
    @IsNotEmpty()
    @IsNumber()
    stock: number;
}

export class ReviewDailyReportDto {
    @ApiProperty({ description: 'Report status', required: true })
    @IsNotEmpty()
    @IsEnum(StatusReportEnum)
    status: StatusReportEnum;

    @ApiProperty({ description: 'Rejection reason', required: false })
    @IsOptional()
    @IsString()
    rejectionReason?: string;
}

export class UpdateProductQuantityDto {
    @ApiProperty({ description: 'The new quantity of the product', required: true })
    @IsNotEmpty()
    @IsNumber()
    quantity: number;
}