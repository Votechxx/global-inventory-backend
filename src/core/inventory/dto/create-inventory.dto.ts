import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateInventoryDto {
  @ApiProperty({
    description: 'The name of the inventory',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The initial balance of the inventory',
    required: true,
    example: 1000.0,
  })
  @IsNotEmpty()
  @IsNumber()
  initialBalance: number;
}