import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CreateUserDto } from 'src/core/user/dto/user.dto';

export class LoginDto {
    @ApiProperty({
        example: 'example@gmail.com',
        description: 'Email',
        required: true,
    })
    @IsEmail()
    @IsNotEmpty()
    @Transform(({ value }) => value.toLowerCase().trim())
    email: string;

    @ApiProperty({
        example: 'MeMo@1',
        description: 'Password',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    password: string;

    @ApiProperty({
        description: 'Firebase Cloud Messaging Token',
        required: false,
    })
    @IsOptional()
    @IsString()
    fcmToken?: string;
}

export class SignupDto extends OmitType(CreateUserDto, ['role']) {}

export class ResetPasswordDto {
    @ApiProperty({
        example: 'example@gmail.com',
        description: "User's email",
        required: true,
        type: String,
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        example: '123456',
        description: "User's new password",
        required: true,
        type: String,
    })
    @IsString()
    @IsNotEmpty()
    password: string;

    @ApiProperty({
        example: '123456',
        description: "User's OTP",
        required: true,
        type: String,
    })
    @IsString()
    @IsNotEmpty()
    otp: string;
}

export class CheckOtpDto extends OmitType(ResetPasswordDto, ['password']) {}

export class GoogleLoginDto {
    @ApiProperty({
        type: String,
        description: 'Access token from google',
        example: 'ya29.a0AfH6SMB1X7F3w6JQXx8 ...',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    accessToken: string;

    @ApiProperty({
        description: 'Firebase Cloud Messaging Token',
        required: false,
    })
    @IsString()
    @IsOptional()
    fcmToken?: string;
}

export class LogoutDto {
    @ApiProperty({
        description: 'Firebase Cloud Messaging Token',
        required: false,
    })
    @IsOptional()
    @IsString()
    fcmToken?: string;
}

export class UpdatePasswordDto {
    @ApiProperty({
        example: '123456',
        description: "User's old password",
        required: true,
        type: String,
    })
    @IsString()
    @IsNotEmpty()
    oldPassword: string;

    @ApiProperty({
        example: 'MeMo@1',
        description: "User's new password",
        required: true,
        type: String,
    })
    @IsString()
    @IsNotEmpty()
    newPassword: string;
}
