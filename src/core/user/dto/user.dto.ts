import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { $Enums, GenderEnum, RoleEnum } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
    IsBoolean,
    IsDate,
    IsEmail,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsPhoneNumber,
    IsPostalCode,
    IsString,
} from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

interface UserInterface {
    name?: string;
    email?: string;
    role?: RoleEnum;
    password?: string;
    address?: string;
    phoneNumber?: string;
    profileImageId?: number;
}

export class UserDto implements UserInterface {
    @ApiProperty({
        description: 'The first name of the user',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    firstName: string;

    @ApiProperty({
        description: 'The last name of the user',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    lastName: string;

    @ApiProperty({
        example: 'memomeme621@gmail.com',
        description: 'The email address of the user',
        required: true,
    })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({
        example: RoleEnum.GUARD,
        description: 'The role of the user',
        required: false,
        default: RoleEnum.USER,
        enum: RoleEnum,
    })
    @IsOptional()
    @IsEnum(RoleEnum)
    role?: RoleEnum;

    @ApiProperty({
        example: 'MeMo@1',
        description:
            'The password of the user, required if no Google or Apple ID',
        required: false,
    })
    @IsOptional()
    @IsString()
    password?: string;

    @ApiProperty({
        example: 'Cairo',
        description: 'The address of the user',
        type: String,
        required: false,
    })
    @IsOptional()
    @IsString()
    address?: string;

    @ApiProperty({
        example: '+201234567890',
        description:
            'The phone number of the user, required if no Google or Apple ID',
        required: true,
    })
    @IsNotEmpty()
    @IsPhoneNumber()
    phoneNumber: string;

    @ApiProperty({
        example: 1,
        description: 'The ID of the user profile picture',
        type: Number,
        required: false,
    })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    profileImageId?: number;

    ip: string;
}

export class UserQueryDto extends PaginationDto implements UserInterface {
    @ApiProperty({
        description: 'ID',
        required: false,
    })
    @IsInt()
    @IsOptional()
    @Type(() => Number)
    id?: number;

    @ApiProperty({
        description: 'Is Deleted',
        required: false,
    })
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    isDeleted?: boolean;

    @ApiProperty({
        description: 'Address',
        required: false,
    })
    @IsString()
    @IsOptional()
    address?: string;

    @ApiProperty({
        description: 'Name',
        required: false,
    })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({
        description: 'Email',
        required: false,
    })
    @IsString()
    @IsOptional()
    email?: string;

    @ApiProperty({
        enum: RoleEnum,
        description: 'role of user',
        required: false,
    })
    @IsEnum(RoleEnum)
    @IsOptional()
    role?: $Enums.RoleEnum;

    @ApiProperty({
        description: 'phone number of the user',
        required: false,
    })
    @IsString()
    @IsOptional()
    phoneNumber?: string;
}

export class AdminCreateUserDto {
    @ApiProperty({
        description: 'The first name of the user',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    firstName: string;

    @ApiProperty({
        description: 'The last name of the user',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    lastName: string;

    @ApiProperty({
        description: 'The email address of the user',
        example: 'example@gmail.com',
        required: true,
    })
    @IsEmail()
    @Transform(({ value }) => value.toLowerCase().trim())
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'The date of birth of the user',
        required: false,
    })
    @IsDate()
    @IsOptional()
    @Type(() => Date)
    dob?: Date;

    @ApiProperty({
        example: GenderEnum.MALE,
        description: 'The gender of the user',
        required: false,
        enum: GenderEnum,
    })
    @IsOptional()
    @IsEnum(GenderEnum)
    gender?: GenderEnum;

    @ApiProperty({
        example: RoleEnum.GUARD,
        description: 'The role of the user',
        required: true,
        default: RoleEnum.USER,
        enum: RoleEnum,
    })
    @IsNotEmpty()
    @IsEnum(RoleEnum)
    role: RoleEnum;

    @ApiProperty({
        example: 'MeMo@1',
        description: 'The password of the user',
        type: String,
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    password: string;

    @ApiProperty({
        example: true,
        description: 'the verification status of user',
        type: String,
        required: false,
        default: false,
    })
    @IsOptional()
    @IsBoolean()
    verified?: boolean;

    @ApiProperty({
        description: 'The phone number of the user',
        required: false,
        example: '+201234567890',
    })
    @IsOptional()
    @IsPhoneNumber()
    phoneNumber?: string;
}

export class CreateUserDto {
    @ApiProperty({
        description: 'The first name of the user',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    firstName: string;

    @ApiProperty({
        description: 'The last name of the user',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    lastName: string;

    @ApiProperty({
        description: 'The email address of the user',
        example: 'example@gmail.com',
        required: true,
    })
    @IsNotEmpty()
    @Transform(({ value }) => value.toLowerCase().trim())
    @IsEmail()
    email: string;

    @ApiProperty({
        example: 'st 1',
        description: 'The address of the user',
        required: false,
    })
    @IsOptional()
    @IsString()
    address?: string;

    @ApiProperty({
        example: 'Cairo',
        description: 'The city of the user',
        required: false,
    })
    @IsOptional()
    @IsString()
    city?: string;

    @ApiProperty({
        example: '132131',
        description: 'The zipCode of the user',
        required: false,
    })
    @IsOptional()
    @IsPostalCode('any')
    zipCode?: string;

    @ApiProperty({
        description: 'The date of birth of the user',
        required: false,
    })
    @IsDate()
    @IsOptional()
    @Type(() => Date)
    dob?: Date;

    @ApiProperty({
        example: GenderEnum.MALE,
        description: 'The gender of the user',
        required: false,
        enum: GenderEnum,
    })
    @IsOptional()
    @IsEnum(GenderEnum)
    gender?: GenderEnum;

    @ApiProperty({
        example: RoleEnum.GUARD,
        description: 'The role of the user',
        required: false,
        default: RoleEnum.USER,
        enum: RoleEnum,
    })
    @IsOptional()
    @IsEnum(RoleEnum)
    role?: RoleEnum;

    @ApiProperty({
        example: 'MeMo@1',
        description:
            'The password of the user, required if no Google or Apple ID',
        required: false,
    })
    @IsOptional()
    @IsString()
    password?: string;

    verified?: boolean;
    googleId?: string;
    appleId?: string;

    @ApiProperty({
        description: 'The phone number of the user',
        required: false,
        example: '+201234567890',
    })
    @IsOptional()
    @IsPhoneNumber()
    phoneNumber?: string;
}

export class UpdateUserDto extends PartialType(
    OmitType(CreateUserDto, ['appleId', 'googleId'] as const),
) {
    @ApiProperty({
        required: false,
        type: Boolean,
    })
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    verified?: boolean;
}

export class UpdateUserDataDto extends PartialType(
    OmitType(UpdateUserDto, [
        'password',
        'gender',
        'verified',
        'role',
        'dob',
        'email',
        'verified',
    ] as const),
) {}
