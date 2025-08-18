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

  @ApiProperty({
    description: 'Expense ID (optional, for single expense)',
    required: false,
  })
  @IsOptional()
  @IsInt()
  expenseId?: number;

  @ApiProperty({
    description: 'List of expenses (for admin only)',
    required: false,
    type: [ShipmentExpenseDto],
  })
  @IsOptional()
  @IsArray()
  expenses?: ShipmentExpenseDto[];
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

  @ApiProperty({ description: 'Inventory ID' })
  @IsNotEmpty()
  @IsInt()
  inventoryId: number;

  @ApiProperty({ description: 'Expense ID (if applicable)' })
  @IsOptional()
  @IsInt()
  expenseId?: number;

  @ApiProperty({ description: 'Total price of expenses' })
  @IsNotEmpty()
  @IsNumber()
  totalPrice: number;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Update date' })
  updatedAt: Date;
}

export class ShipmentQueryDto extends PartialType(
  IntersectionType(
    OmitType(ShipmentResponseDto, ['createdAt', 'updatedAt', 'totalPrice'] as const),
    PaginationDto,
  ),
) {}