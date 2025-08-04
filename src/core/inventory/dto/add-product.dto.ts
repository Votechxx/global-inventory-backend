import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class AddProductDto {
  @ApiProperty({
    description: 'The ID of the product to add',
    required: true,
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  productId: number;

  @ApiProperty({
    description: 'The quantity of the product to add',
    required: true,
    example: 50,
  })
  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @ApiProperty({
     description : 'The price of the product to add',
      required : true,
      example : 100.50,
  })
  @IsNotEmpty()
  @IsNumber()
  price: number;
  
}