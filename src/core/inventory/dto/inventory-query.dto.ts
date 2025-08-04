import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class InventoryQueryDto extends PaginationDto {
  @ApiProperty({
    description: 'The ID of the inventory',
    required: false,
  })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  id?: number;

  @ApiProperty({
    description: 'The name of the inventory',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'The minimum balance of the inventory',
    required: false,
    example: 500.0,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  minBalance?: number;

  @ApiProperty({
    description: 'The maximum balance of the inventory',
    required: false,
    example: 2000.0,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  maxBalance?: number;
}