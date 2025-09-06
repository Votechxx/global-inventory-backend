import { ApiProperty, OmitType, PickType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsNumber } from 'class-validator';

export class ReportProductDto {
    @ApiProperty({
        description: 'The unique identifier of the report product',
        required: true,
    })
    @IsInt()
    @Type(() => Number)
    @IsNotEmpty()
    id: number;

    @ApiProperty({
        description: 'The ID of the report associated with the product',
        required: true,
    })
    @IsInt()
    @Type(() => Number)
    @IsNotEmpty()
    reportId: number;

    @ApiProperty({
        description: 'The ID of the product unit',
        required: true,
    })
    @IsInt()
    @Type(() => Number)
    @IsNotEmpty()
    productUnitId: number;

    @ApiProperty({
        description: 'The quantity of the product in pieces',
        required: true,
    })
    @IsInt()
    @Type(() => Number)
    @IsNotEmpty()
    quantity: number; // العدد بالقطع ex: 200 pieces   (pallets * piecesPerPallet) ex: 1.5 pallets * 144 pieces per pallet = 216 pieces

    @ApiProperty({
        description: 'The number of pieces per pallet for the product',
        required: true,
    })
    @IsInt()
    @Type(() => Number)
    @IsNotEmpty()
    piecesPerPallet: number;

    @ApiProperty({
        description: 'The number of pallets for the product',
        required: true,
    })
    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber()
    pallets: number; // عدد البالتات (quantity / piecesPerPallet) ex: 1.5 pallets

    @ApiProperty({
        description: 'The unit price of the product',
        required: true,
    })
    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber()
    unitPrice: number;

    @ApiProperty({
        description: 'The total price of the product',
        required: true,
    })
    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber()
    totalPrice: number; // السعر الإجمالي (pallets * unitPrice)

    createdAt: Date;
    updatedAt: Date;
}

export class CreateReportProductDto extends OmitType(ReportProductDto, [
    'id',
    'createdAt',
    'updatedAt',
] as const) {}

export class UserAddReportProductDto extends PickType(CreateReportProductDto, [
    'quantity',
    'productUnitId',
] as const) {}
