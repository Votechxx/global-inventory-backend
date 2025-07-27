import { ApiProperty, OmitType } from '@nestjs/swagger';
import { FileSourceEnum, FileTypeEnum } from '@prisma/client';
import { Type } from 'class-transformer';
import {
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator';
import { FileCategoryEnum } from 'src/file/enum/file-category.enum';

export class FileDto {
    @ApiProperty({
        description: 'The unique identifier of the file',
        required: true,
    })
    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    id: number;

    @ApiProperty({
        description: 'The name of the file',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        description: 'The path of the file',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    @IsNotEmpty()
    path: string;

    @ApiProperty({
        description: 'The URL of the file',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    @IsNotEmpty()
    url: string;

    @ApiProperty({
        description: 'The source of the file',
        required: true,
        enum: FileSourceEnum,
        default: FileSourceEnum.LOCAL,
    })
    @IsNotEmpty()
    @IsEnum(FileSourceEnum)
    @IsOptional()
    source: FileSourceEnum;

    @ApiProperty({
        description: 'Category of the file',
        enum: FileCategoryEnum,
        required: true,
    })
    @IsNotEmpty()
    @IsEnum(FileCategoryEnum)
    category: FileCategoryEnum;

    @ApiProperty({
        description: 'The type of the file',
        required: true,
        enum: FileTypeEnum,
    })
    @IsNotEmpty()
    @IsEnum(FileTypeEnum)
    type: FileTypeEnum;

    @ApiProperty({
        description: 'The size of the file in bytes',
        required: true,
    })
    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    size: number;

    createdAt: Date;
    updatedAt: Date;
}

export class CreateFileDto extends OmitType(FileDto, [
    'createdAt',
    'updatedAt',
    'id',
]) {}
