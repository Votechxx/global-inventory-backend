import {
    IsNotEmpty,
    IsNumber,
    IsString,
    IsOptional,
    IsEnum,
    IsInt,
    IsArray,
} from 'class-validator';
import {
    ApiProperty,
    IntersectionType,
    OmitType,
    PartialType,
} from '@nestjs/swagger';
import { ExpenseTag, StatusShipmentEnum } from '@prisma/client';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Type } from 'class-transformer';

export class ShipmentExpenseDto {
    @ApiProperty({ description: 'Expense name', required: true })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ description: 'Expense amount', required: true })
    @IsNotEmpty()
    @IsNumber()
    amount: number;

    @ApiProperty({ description: 'Expense description', required: false })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({
        description: 'Expense tag',
        required: false,
        enum: ExpenseTag,
    })
    @IsOptional()
    @IsString()
    @IsEnum(ExpenseTag)
    tag?: ExpenseTag;
}

export class ShipmentProductDto {
    @ApiProperty({ description: 'Product Unit ID associated with the shipment', required: true })
    @IsNotEmpty()
    @IsInt()
    @Type(() => Number)
    productUnitId: number;

    @ApiProperty({ description: 'Quantity in pieces', required: true })
    @IsNotEmpty()
    @IsInt()
    @Type(() => Number)
    quantity: number;

    @ApiProperty({ description: 'Pieces per pallet', required: true })
    @IsNotEmpty()
    @IsInt()
    @Type(() => Number)
    piecesPerPallet: number;

    @ApiProperty({ description: 'Unit price per pallet', required: true })
    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    unitPrice: number;
}

export class CreateShipmentDto {
    @ApiProperty({ description: 'The shipment title', required: true })
    @IsNotEmpty()
    @IsString()
    title: string;

    @ApiProperty({
        description: 'List of shipment products',
        required: true,
        type: [ShipmentProductDto],
    })
    @IsNotEmpty()
    @IsArray()
    shipmentProducts: ShipmentProductDto[];

    @ApiProperty({
        description: 'List of shipment expenses',
        required: false,
        type: [ShipmentExpenseDto],
    })
    @IsOptional()
    @IsArray()
    shipmentExpenses?: ShipmentExpenseDto[];
}

export class UpdateShipmentDto {
    @ApiProperty({ description: 'The shipment title', required: false })
    @IsOptional()
    @IsString()
    title?: string;

    @ApiProperty({ description: 'Number of trucks', required: false })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    numberOfTrucks?: number;

    @ApiProperty({
        description: 'List of shipment products to update',
        required: false,
        type: [ShipmentProductDto],
    })
    @IsOptional()
    @IsArray()
    shipmentProducts?: ShipmentProductDto[];

    @ApiProperty({
        description: 'List of shipment expenses to add',
        required: false,
        type: [ShipmentExpenseDto],
    })
    @IsOptional()
    @IsArray()
    shipmentExpenses?: ShipmentExpenseDto[];
}

export class ShipmentResponseDto {
    @ApiProperty({ description: 'Shipment ID' })
    @IsNotEmpty()
    @IsInt()
    id: number;

    @ApiProperty({ description: 'Shipment UUID' })
    @IsNotEmpty()
    @IsString()
    uuid: string;

    @ApiProperty({ description: 'The shipment title' })
    @IsNotEmpty()
    @IsString()
    title: string;

    @ApiProperty({ description: 'Number of trucks' })
    @IsNotEmpty()
    @IsInt()
    numberOfTrucks: number;

    @ApiProperty({ description: 'Shipment status' })
    @IsNotEmpty()
    @IsEnum(StatusShipmentEnum)
    status: StatusShipmentEnum;

    @ApiProperty({ description: 'Waiting for changes flag' })
    @IsNotEmpty()
    isWaitingForChanges: boolean;

    @ApiProperty({ description: 'Inventory ID' })
    @IsNotEmpty()
    @IsInt()
    inventoryId: number;

    @ApiProperty({ description: 'Total price of shipment expenses' })
    @IsNotEmpty()
    @IsNumber()
    totalPrice: number;

    @ApiProperty({
        description: 'List of shipment products',
        type: [ShipmentProductDto],
    })
    @IsOptional()
    @IsArray()
    shipmentProducts?: ShipmentProductDto[];

    @ApiProperty({ description: 'Creation date' })
    createdAt: Date;

    @ApiProperty({ description: 'Update date' })
    updatedAt: Date;

    @ApiProperty({
        description: 'List of shipment expenses',
        type: [ShipmentExpenseDto],
    })
    shipmentExpenses: ShipmentExpenseDto[];
}

export class ShipmentQueryDto extends PartialType(
    IntersectionType(
        OmitType(ShipmentResponseDto, [
            'createdAt',
            'updatedAt',
            'totalPrice',
            'shipmentExpenses',
            'shipmentProducts',
        ] as const),
        PaginationDto,
    ),
) {}