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
    PartialType,
    PickType,
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

export class AddShipmentProductDto {
    @ApiProperty({
        description: 'Product Unit ID associated with the shipment',
        required: true,
    })
    @IsNotEmpty()
    @IsInt()
    @Type(() => Number)
    productUnitId: number;

    @ApiProperty({ description: 'Quantity in pieces', required: true })
    @IsNotEmpty()
    @IsInt()
    @Type(() => Number)
    quantity: number;
}

export class CreateShipmentDto {
    @ApiProperty({ description: 'The shipment title', required: true })
    @IsNotEmpty()
    @IsString()
    title: string;

    @ApiProperty({
        description: 'List of shipment expenses',
        required: false,
        type: [ShipmentExpenseDto],
    })
    @IsOptional()
    @IsArray()
    shipmentExpenses?: ShipmentExpenseDto[];

    @ApiProperty({
        description: 'ID of the inventory the shipment belongs to',
        required: true,
    })
    @IsNotEmpty()
    @IsInt()
    @Type(() => Number)
    inventoryId: number;
}

export class UpdateShipmentDto {
    @ApiProperty({ description: 'The shipment title', required: false })
    @IsOptional()
    @IsString()
    title?: string;

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
    @Type(() => Number)
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
    @Type(() => Number)
    numberOfTrucks: number;

    @ApiProperty({ description: 'Shipment status' })
    @IsNotEmpty()
    @IsEnum(StatusShipmentEnum)
    status: StatusShipmentEnum;

    @ApiProperty({
        description:
            'shipment card expenses, this will affect the inventory balance',
    })
    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    shipmentCardExpenses: number | null;

    @ApiProperty({
        description:
            'shipment clark installment expenses, this will affect the inventory balance',
    })
    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    clarkInstallmentExpenses: number | null;

    @ApiProperty({
        description:
            'Other expenses related to the shipment, this will affect the inventory balance',
    })
    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    otherExpenses: number | null;

    @ApiProperty({ description: 'Inventory ID' })
    @IsNotEmpty()
    @IsInt()
    @Type(() => Number)
    inventoryId: number;

    @ApiProperty({ description: 'Total price of shipment expenses' })
    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    totalPrice: number;

    @ApiProperty({
        description: 'List of shipment products',
        type: [AddShipmentProductDto],
    })
    @IsOptional()
    @IsArray()
    shipmentProducts?: AddShipmentProductDto[];

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

export class SubmitShipmentForReview {
    @ApiProperty({
        description: 'List of shipment products',
        required: true,
        type: [AddShipmentProductDto],
    })
    @IsNotEmpty()
    @IsArray()
    addShipmentProducts: AddShipmentProductDto[];
}

export class RequestShipmentUpdateDto {
    @ApiProperty({ description: 'Message for the review', required: true })
    @IsNotEmpty()
    @IsString()
    reviewMessage: string;
}

export class ShipmentQueryDto extends PartialType(
    IntersectionType(
        PickType(ShipmentResponseDto, [
            'id',
            'inventoryId',
            'numberOfTrucks',
            'status',
            'title',
            'uuid',
        ] as const),
        PaginationDto,
    ),
) {}
