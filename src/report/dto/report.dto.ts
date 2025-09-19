import {
    ApiProperty,
    IntersectionType,
    OmitType,
    PartialType,
    PickType,
} from '@nestjs/swagger';
import { ReportStatusEnum } from '@prisma/client';
import { UserAddReportProductDto } from './report-product.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import {
    IsArray,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ReportDto {
    @ApiProperty({
        description: 'The unique identifier of the report',
        required: true,
    })
    @IsInt()
    @Type(() => Number)
    @IsNotEmpty()
    id: number;

    @ApiProperty({
        description: 'The UUID of the report',
        required: true,
    })
    @IsNotEmpty()
    @IsUUID()
    uuid: string;

    @ApiProperty({
        description: 'The title of the report',
        required: false,
    })
    @IsOptional()
    @IsString()
    title?: string;

    @ApiProperty({
        description: 'The ID of the user who created the report',
        required: true,
    })
    @IsInt()
    @Type(() => Number)
    @IsNotEmpty()
    userId: number;

    @ApiProperty({
        description: 'The ID of the inventory',
        required: true,
    })
    @IsInt()
    @Type(() => Number)
    @IsNotEmpty()
    inventoryId: number;

    @ApiProperty({
        description: 'The total expected selled money amount',
        required: true,
    })
    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber()
    expectedSelledMoneyAmount: number;

    @ApiProperty({
        description: 'The total expenses money amount',
        required: true,
    })
    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber()
    totalExpensesMoneyAmount: number;

    @ApiProperty({
        description:
            'The net money amount (expectedSelledMoneyAmount - totalExpensesMoneyAmount)',
        required: true,
    })
    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber()
    netMoneyAmount: number;

    @ApiProperty({
        description:
            'The current money amount (the actual money in hand in that inventory)',
        required: true,
    })
    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber()
    currentMoneyAmount: number;

    @ApiProperty({
        description:
            'The real net money amount (currentMoneyAmount - balance in the inventory)',
        required: true,
    })
    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber()
    realNetMoneyAmount: number;

    @ApiProperty({
        description:
            'The broken money amount (the total money amount of broken products) -> (netMoneyAmount - realNetMoneyAmount)',
        required: true,
    })
    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber()
    brokenMoneyAmount: number;

    @ApiProperty({
        description:
            'The broken rate (percentage of broken products) -> (brokenMoneyAmount * 100 / expectedSelledMoneyAmount)',
        required: true,
    })
    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber()
    brokenRate: number;

    @ApiProperty({
        description:
            'The money amount to be deposited to the inventory (the money amount that should be deposited to the inventory)',
        required: false,
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    depositMoneyAmount?: number;

    @ApiProperty({
        description:
            'The image ID of the deposit slip (the image that shows the deposit transaction)',
        required: false,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    depositImageId?: number;

    @ApiProperty({
        description: 'The status of the report',
        enum: ReportStatusEnum,
        required: false,
        default: ReportStatusEnum.IN_REVIEW,
    })
    @IsNotEmpty()
    @IsOptional()
    @IsString()
    @IsEnum(ReportStatusEnum)
    status?: ReportStatusEnum = ReportStatusEnum.IN_REVIEW;

    @ApiProperty({
        description: 'The reason message for requesting changes or rejection',
        required: false,
    })
    @IsOptional()
    @IsString()
    reasonMessage?: string;

    createdAt: Date;
    updatedAt: Date;
}

export class CreateReportDto extends OmitType(ReportDto, [
    'id',
    'uuid',
    'createdAt',
    'updatedAt',
] as const) {}

export class UserCreateReportDto extends PickType(CreateReportDto, [
    'currentMoneyAmount',
    'title',
] as const) {
    @ApiProperty({
        description: 'The products included in the report',
        required: true,
        type: [UserAddReportProductDto],
    })
    @IsNotEmpty()
    @IsArray()
    @Type(() => UserAddReportProductDto)
    @ValidateNested({ each: true })
    products: UserAddReportProductDto[];
}

export class SubmitDepositDto {
    @ApiProperty({
        description: 'The money amount to be deposited to the inventory',
        required: true,
    })
    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber()
    depositMoneyAmount: number;

    @ApiProperty({
        description: 'The image ID of the deposit slip',
        required: true,
    })
    @IsNotEmpty()
    @Type(() => Number)
    @IsInt()
    depositImageId: number;
}

export class ReportQueryDto extends PartialType(
    IntersectionType(
        PickType(ReportDto, ['id', 'uuid', 'userId'] as const),
        PaginationDto,
    ),
) {
    @ApiProperty({
        description: 'Filter by report status',
        required: false,
        enum: ReportStatusEnum,
    })
    @IsOptional()
    @IsEnum(ReportStatusEnum)
    status?: ReportStatusEnum;
}

export class RequestChangeDto {
    @ApiProperty({
        description: 'The reason message for requesting changes or rejection',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    reasonMessage: string;
}
