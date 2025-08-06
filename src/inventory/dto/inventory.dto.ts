import { IsNotEmpty, IsString, IsOptional, IsArray, ValidateNested, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateInventoryDto {
    @ApiProperty({
        description: 'The name of the inventory',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({
        description: 'The description of the inventory',
        required: false,
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({
        description: 'The location of the inventory',
        required: false,
    })
    @IsOptional()
    @IsString()
    location?: string;
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