import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class AddWorkerDto {
  @ApiProperty({
    description: 'The ID of the worker to add',
    required: true,
    example: 2,
  })
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  workerId: number;
}