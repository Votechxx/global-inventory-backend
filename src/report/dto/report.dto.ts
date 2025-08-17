import {
    ApiProperty,
    IntersectionType,
    OmitType,
    PartialType,
    PickType,
} from '@nestjs/swagger';
import { StatusReportEnum } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
    IsArray,
    IsBoolean,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
    ValidateNested,
} from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class ReportDto {
    @ApiProperty({
        description: 'Unique identifier for the report',
        required: true,
    })
    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    id: number;

    @ApiProperty({
        description: 'UUID for the report',
        required: true,
    })
    @IsNotEmpty()
    @IsUUID()
    uuid: string;

    @ApiProperty({
        description: 'ID of the inventory associated with the report',
        required: true,
    })
    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    inventoryId: number;

    @ApiProperty({
        description: 'ID of the worker who created the report',
        required: true,
    })
    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    workerId: number;

    @ApiProperty({
        description: 'Stock details in JSON format',
        required: true,
    })
    @IsNotEmpty()
    stock: any;

    @ApiProperty({
        description: 'Cash on hand amount',
        required: true,
    })
    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    cashOnHand: number;

    @ApiProperty({
        description: 'Bank deposit amount',
        required: true,
    })
    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    bankDeposit: number;

    @ApiProperty({
        description: 'Status of the report',
        required: true,
        enum: StatusReportEnum,
    })
    @IsNotEmpty()
    @IsEnum(StatusReportEnum)
    status: StatusReportEnum;

    @ApiProperty({
        description:
            'Is required changes value from admin when requesting changes',
        required: false,
    })
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    isRequiredChanges?: boolean;

    @ApiProperty({
        description: 'Reason when rejecting or requesting changes',
        required: false,
    })
    @IsOptional()
    @IsString()
    reason?: string;

    @ApiProperty({
        description: 'ID of the deposit receipt file',
        required: false,
    })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    depositReceiptFileId?: number;

    createdAt: Date;
    updatedAt: Date;
}

export class CreateReportDto extends OmitType(ReportDto, [
    'id',
    'uuid',
    'createdAt',
    'updatedAt',
]) {}

class ProductUnitDto {
    @ApiProperty({
        description: 'ID of the product unit',
        required: true,
    })
    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    productUnitId: number;

    @ApiProperty({
        description: 'Quantity of the product unit (in stock)',
        required: true,
    })
    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    quantity: number;
}

export class SubmitReportDto {
    @ApiProperty({
        description: 'product units with their quantities',
        required: true,
        type: [ProductUnitDto],
        isArray: true,
        example: [
            {
                productUnitId: 1,
                quantity: 10,
            },
            {
                productUnitId: 2,
                quantity: 5,
            },
        ],
    })
    @IsNotEmpty()
    @Type(() => ProductUnitDto)
    @IsArray()
    @ValidateNested({ each: true })
    productUnits: ProductUnitDto[];
}

export class ReportQueryDto extends PartialType(
    IntersectionType(
        PickType(ReportDto, [
            'id',
            'uuid',
            'inventoryId',
            'workerId',
            'status',
            'isRequiredChanges',
        ]),
        PaginationDto,
    ),
) {}
