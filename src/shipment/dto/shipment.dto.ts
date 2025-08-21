import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  IsUUID,
  IsArray,
} from 'class-validator';
import {
  ApiProperty,
  IntersectionType,
  OmitType,
  PartialType,
} from '@nestjs/swagger';
import { StatusShipmentEnum } from '@prisma/client';
import { PaginationDto } from 'src/common/dto/pagination.dto';

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

  @ApiProperty({ description: 'Expense tag', required: false })
  @IsOptional()
  @IsString()
  tag?: string;
}

export class CreateShipmentDto {
  @ApiProperty({ description: 'The shipment title', required: true })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Number of trucks', required: true })
  @IsNotEmpty()
  @IsInt()
  numberOfTrucks: number;

  @ApiProperty({ description: 'List of shipment expenses', required: false, type: [ShipmentExpenseDto] })
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
  numberOfTrucks?: number;

  @ApiProperty({ description: 'Shipment status', required: false, enum: StatusShipmentEnum })
  @IsOptional()
  @IsEnum(StatusShipmentEnum)
  status?: StatusShipmentEnum;

  @ApiProperty({ description: 'Waiting for changes flag', required: false })
  @IsOptional()
  isWaitingForChanges?: boolean;

  @ApiProperty({ description: 'List of shipment expenses to add', required: false, type: [ShipmentExpenseDto] })
  @IsOptional()
  @IsArray()
  shipmentExpenses?: ShipmentExpenseDto[];

  @ApiProperty({ description: 'Review message for admin or worker', required: false })
  @IsOptional()
  @IsString()
  reviewMessage?: string;
}

export class ShipmentResponseDto {
  @ApiProperty({ description: 'Shipment ID' })
  @IsNotEmpty()
  @IsInt()
  id: number;

  @ApiProperty({ description: 'Shipment UUID' })
  @IsNotEmpty()
  @IsUUID()
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

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Update date' })
  updatedAt: Date;

  @ApiProperty({ description: 'List of shipment expenses', type: [ShipmentExpenseDto] })
  shipmentExpenses: ShipmentExpenseDto[];
}

export class ShipmentQueryDto extends PartialType(
  IntersectionType(
    OmitType(ShipmentResponseDto, ['createdAt', 'updatedAt', 'totalPrice', 'shipmentExpenses'] as const),
    PaginationDto,
  ),
) {}