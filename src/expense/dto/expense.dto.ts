import { IsNotEmpty, IsNumber, IsString, IsOptional, IsEnum, IsInt, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ExpenseTag } from '@prisma/client';

export class CreateExpenseDto {
    @ApiProperty({ description: 'The name of the expense', required: true, example: 'Electricity Bill' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ description: 'The amount of the expense', required: true, example: 100.5 })
    @IsNotEmpty()
    @IsNumber()
    amount: number;

    @ApiProperty({ description: 'The description of the expense', required: false, example: 'Monthly bill' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ description: 'The tag of the expense', required: true, enum: ExpenseTag, example: 'ELECTRICITY' })
    @IsNotEmpty()
    @IsEnum(ExpenseTag)
    tag: ExpenseTag;

    @ApiProperty({ description: 'The ID of the inventory', required: true, example: 1 })
    @IsNotEmpty()
    @IsInt()
    inventoryId: number;
}

export class UpdateExpenseDto extends CreateExpenseDto {}