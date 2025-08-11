import {
    IsNotEmpty,
    IsNumber,
    IsString,
    IsOptional,
    IsEnum,
    IsInt,
    IsUUID,
} from 'class-validator';
import {
    ApiProperty,
    IntersectionType,
    OmitType,
    PartialType,
} from '@nestjs/swagger';
import { ExpenseTag } from '@prisma/client';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class ExpenseDto {
    @ApiProperty({
        description: 'The unique identifier of the expense',
        required: true,
    })
    @IsNotEmpty()
    @IsInt()
    id: number;

    @ApiProperty({
        description: 'The unique UUID of the expense',
        required: true,
    })
    @IsNotEmpty()
    @IsUUID()
    uuid: string;

    @ApiProperty({
        description: 'The name of the expense',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({
        description: 'The amount of the expense',
        required: true,
    })
    @IsNotEmpty()
    @IsNumber()
    amount: number;

    @ApiProperty({
        description: 'The description of the expense',
        required: false,
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({
        description: 'The tag of the expense',
        required: true,
        enum: ExpenseTag,
    })
    @IsNotEmpty()
    @IsEnum(ExpenseTag)
    tag: ExpenseTag;

    @ApiProperty({
        description: 'The ID of the inventory',
        required: true,
    })
    @IsNotEmpty()
    @IsInt()
    inventoryId: number;

    @ApiProperty({
        description: 'The user Id (worker id) who want to create the expense',
        required: true,
    })
    @IsNotEmpty()
    @IsInt()
    userId: number;

    createdAt: Date;
    updatedAt: Date;
}

export class CreateExpenseDto extends OmitType(ExpenseDto, [
    'id',
    'uuid',
    'createdAt',
    'updatedAt',
]) {}

export class UserCreateExpenseDto extends OmitType(CreateExpenseDto, [
    'userId',
] as const) {}

export class UpdateExpenseDto extends PartialType(
    OmitType(UserCreateExpenseDto, ['inventoryId'] as const),
) {}

export class ExpenseQueryDto extends PartialType(
    IntersectionType(
        OmitType(ExpenseDto, [
            'updatedAt',
            'createdAt',
            'description',
        ] as const),
        PaginationDto,
    ),
) {}
