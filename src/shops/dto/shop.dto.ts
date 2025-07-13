//dto for the shop entity
//with description and examples and validation
import { IsString, IsNotEmpty, IsOptional, IsPhoneNumber, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateShopDto {
    @ApiProperty({
        description: 'Name of the shop',
        example: 'Tech Store',
    })
    @IsString()
    @IsNotEmpty()
    @Length(2, 100)
    @Transform(({ value }) => value?.trim())
    name: string;

    @ApiPropertyOptional({
        description: 'Description of the shop',
        example: 'A shop specializing in electronics and gadgets.',
    })
    @IsString()
    @IsOptional()
    @Length(0, 255)
    @Transform(({ value }) => value?.trim())
    description?: string;

    @ApiProperty({
        description: 'Location of the shop',
        example: '123 Main St, Springfield',
    })
    @IsString()
    @IsNotEmpty()
    @Length(2, 150)
    @Transform(({ value }) => value?.trim())
    location: string;

    @ApiPropertyOptional({
        description: 'Contact phone number of the shop',
        example: '+1234567890',
    })
    @IsString()
    @IsOptional()
    @IsPhoneNumber(null)
    @Transform(({ value }) => value?.trim())
    phoneNumber?: string;
}
export class UpdateShopDto extends PartialType(CreateShopDto) {
}