import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { Environment } from 'src/common/enums/environment.enum';
import { Prisma, RoleEnum, User } from '@prisma/client';
import { EmailService } from 'src/common/modules/email/email.service';
import { UserCreationMethod } from '../user/enum/creation-method.enum';
import { isEmail } from 'class-validator';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import { OtpService } from 'src/common/modules/otp/otp.service';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import { UserRepo } from '../user/repo/user.repo';
import {
    SignupDto,
    CheckOtpDto,
    LoginDto,
    LogoutDto,
    ResetPasswordDto,
    UpdatePasswordDto,
    GoogleLoginDto,
} from './dto/auth.dto';
import { UserHelper } from '../user/helpers/user.helper';
import { CreateUserDto } from '../user/dto/user.dto';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { UPLOAD_PATH } from 'src/common/constants/path.constant';
import { installPicture } from 'src/common/utils/install-picture';
import { ENV_VARIABLES } from 'src/common/config/env.config';

@Injectable()
export class AuthService {
    constructor(
        private readonly config: ConfigService,
        private readonly emailService: EmailService,
        private readonly prismaService: PrismaService,
        private readonly otpService: OtpService,
        private readonly jwt: JwtService,
        private readonly userRepo: UserRepo,
        private readonly userHelper: UserHelper,
    ) {}

    async login(
        loginData: LoginDto,
    ): Promise<{ access_token: string; role: RoleEnum }> {
        if (!loginData.email)
            throw new BadRequestException('Email or Phone number is required');
        let user: User;
        if (loginData.email)
            user = await this.userRepo.getUserByEmail(loginData.email);
        // else if (loginData.phoneNumber)
        //     user = await this.userRepo.getUserByPhoneNumber(
        //         loginData.phoneNumber,
        //     );
        else throw new BadRequestException('Email or Phone number is required');
        if (!user)
            throw new NotFoundException("email or password doesn't match");
        if (user.isDeleted) throw new BadRequestException('User not found');
        if (!user.verified) {
            let isEmailSent = false;
            // if last verification email sent more than 5 minutes send another email
            if (
                user.verificationEmailedAt &&
                new Date().getTime() - user.verificationEmailedAt.getTime() >
                    5 * 60 * 1000
            ) {
                try {
                    await this.sendTokenEmailVerification(user);
                    isEmailSent = true;
                } catch (error) {
                    console.log('Error sending email verification', error);
                }
            }
            throw new ForbiddenException(
                `Email is not verified${isEmailSent ? ', please check your email' : ''}`,
            );
        }
        // if (user.isBlocked) throw new ForbiddenException('User is blocked');
        const validPassword = await argon2.verify(
            user.password,
            loginData.password,
        );
        if (!validPassword) throw new ForbiddenException('Invalid password');
        const access_token = await this.signToken(user.id, user.email);
        return { access_token, role: user.role };
    }

    async sendTokenEmailVerification(user: User): Promise<{ message: string }> {
        const email = user.email.toLowerCase().trim();
        // for 5 minutes
        const token = await this.signTokenWithEmail(email, '30m');
        const otp = this.otpService.generateOtp();
        const hashedOtp = await this.otpService.hashOtp(otp);
        const dateNow = new Date();
        const date = new Date(dateNow.getTime() + 60 * 1000 * 60); // 1 hour
        const url = `${ENV_VARIABLES.baseUrl}/api/auth/verify-account?token=${token}&otp=${otp}`;
        await this.emailService.verifyAccount(user, url);
        await this.prismaService.user.update({
            where: {
                id: user.id,
            },
            data: {
                verificationEmailedAt: new Date(),
                otp: hashedOtp,
                dateToExpireOtp: date,
            },
        });
        return { message: 'Email sent successfully' };
    }

    async signup(signUpDto: SignupDto, ip: string): Promise<string> {
        signUpDto.password = await argon2.hash(signUpDto.password);
        const username = await this.userHelper.suggestUsername(
            signUpDto.firstName,
        );
        const existingUser = await this.userRepo.getUserByEmail(
            signUpDto.email,
        );
        let user: User = null;
        if (existingUser && existingUser.isDeleted === false)
            throw new BadRequestException('user already exists');
        if (existingUser && existingUser.isDeleted)
            user = await this.userRepo.recoverUser(existingUser.id, {
                ...signUpDto,
                username,
            });
        else user = await this.userRepo.createUser({ ...signUpDto, username });
        let isEmailSent = false;
        try {
            await this.sendTokenEmailVerification(user);
            isEmailSent = true;
        } catch (error) {
            console.log('Error sending email verification', error);
        }
        return `User created successfully${isEmailSent ? ', please check your email' : ''}`;
    }

    async forgetPassword(email: string) {
        email = email.toLowerCase().trim();
        if (!isEmail(email)) throw new BadRequestException('Invalid email');
        const user = await this.prismaService.user.findUnique({
            where: {
                email,
            },
        });
        if (!user) throw new NotFoundException('User not found');
        const otp = this.otpService.generateOtp();
        const hashedOtp = await this.otpService.hashOtp(otp);
        const dateNow = new Date();
        const date = new Date(dateNow.getTime() + 60 * 1000 * 60); // 1 hour
        await this.prismaService.user.update({
            where: {
                id: user.id,
            },
            data: {
                otp: hashedOtp,
                dateToExpireOtp: date,
            },
        });
        await this.emailService.forgetPassword(user, otp);
        return { message: 'OTP sent to email' };
    }

    async checkOtp(checkOtpDto: CheckOtpDto) {
        const email = checkOtpDto.email.toLowerCase().trim();
        const otp = checkOtpDto.otp;
        if (!isEmail(email)) throw new BadRequestException('Invalid email');
        const user = await this.prismaService.user.findUnique({
            where: {
                email,
            },
        });
        if (!user) throw new NotFoundException('Invalid OTP or expired');
        if (!user.otp) throw new ForbiddenException('Invalid OTP or expired');
        const validOtp = await this.otpService.verifyOtp(otp, user.otp);
        if (user.dateToExpireOtp < new Date())
            throw new ForbiddenException('Invalid OTP or expired');
        if (!validOtp) throw new ForbiddenException('Invalid OTP or expired');
        return { message: 'Valid OTP' };
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto) {
        const { password, ...rest } = resetPasswordDto;
        if (!isEmail(rest.email)) {
            throw new BadRequestException('Invalid email');
        }
        const user = await this.prismaService.user.findUnique({
            where: {
                email: rest.email,
            },
        });
        if (!user) throw new NotFoundException('Invalid OTP or expired');
        await this.checkOtp(rest);
        const hashedPassword = await argon2.hash(password);
        await this.prismaService.user.update({
            where: {
                id: user.id,
            },
            data: {
                password: hashedPassword,
                otp: null,
                dateToExpireOtp: null,
            },
        });
        return { message: 'Password updated successfully' };
    }

    async updatePassword(userId: number, updatePasswordDto: UpdatePasswordDto) {
        const oldPassword = updatePasswordDto.oldPassword;
        const newPassword = updatePasswordDto.newPassword;
        if (!userId || !newPassword) {
            throw new BadRequestException(
                'Invalid data: fields required: [userId, newPassword]',
            );
        }
        const user = await this.prismaService.user.findUnique({
            where: {
                id: userId,
            },
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        if (user.userCreationMethod !== UserCreationMethod.GOOGLE) {
            if (!oldPassword)
                throw new BadRequestException('Old password is required');
            const validPassword = await argon2.verify(
                user.password,
                oldPassword,
            );
            if (!validPassword)
                throw new ForbiddenException('Invalid password');
        }
        const hashedPassword = await argon2.hash(newPassword);
        await this.prismaService.user.update({
            where: {
                id: userId,
            },
            data: {
                password: hashedPassword,
            },
        });
        return { message: 'Password updated successfully' };
    }

    async verifyEmail(token: string, otp: string) {
        const payload: { email: string } = this.jwt.verify(token, {
            secret: this.config.get('JWT_SECRET'),
        });
        if (!payload) {
            throw new ForbiddenException('Invalid token');
        }
        const user = await this.prismaService.user.findUnique({
            where: {
                email: payload.email,
            },
        });
        if (!user) throw new NotFoundException('User not found');
        await this.checkOtp({
            email: user.email,
            otp,
        });
        await this.prismaService.user.update({
            where: {
                id: user.id,
            },
            data: {
                verified: true,
                otp: null,
                dateToExpireOtp: null,
            },
        });
        return { message: 'Email verified successfully' };
    }

    async googleSignIn(googleLoginDto: GoogleLoginDto, ip: string) {
        if (!ip) throw new InternalServerErrorException('IP is required');
        const tokenInfo = await this.googleTokenInfo(
            googleLoginDto.accessToken,
        );
        const googleUserId = tokenInfo.sub;
        const email: string = tokenInfo.email.toLowerCase();
        const userInfo = await this.googleUserInfo(googleLoginDto.accessToken);
        const name = userInfo.name; // .replace(/\s+/g, '_')// Replace spaces with underscores
        const username = await this.userHelper.suggestUsername(name);
        const userPhotoUrl = userInfo.picture;
        console.log({ googleUserId, email, userInfo, username, userPhotoUrl });
        const names = name.split(' ');
        const firstName = names[0];
        const lastName = names[names.length - 1];
        const user = await this.prismaService.user.findUnique({
            where: {
                email,
            },
        });
        if (!user) {
            const newUser: CreateUserDto = {
                email,
                firstName,
                lastName,
                googleId: googleUserId,
                verified: true,
                role: RoleEnum.USER,
            };
            const createdUser = await this.userRepo.CreateGoogleUser({
                ...newUser,
                username,
            });
            const accessToken = await this.signToken(createdUser.id, email);
            console.log('access token passed');
            if (userPhotoUrl) {
                const path = join('user', createdUser.id.toString());
                console.log('trying to create path');
                if (!existsSync(join(UPLOAD_PATH, path)))
                    mkdirSync(join(UPLOAD_PATH, path), { recursive: true });
                console.log('Path passed');
                await installPicture(userPhotoUrl, path, 'profile.jpg');
                console.log('Photo installed');
            }
            console.log('User Photo passed');
            return { access_token: accessToken, user: createdUser };
        }
        if (!user.googleId) user.googleId = googleUserId;
        if (user.googleId !== googleUserId)
            throw new ForbiddenException('Invalid Google account');

        const updatedValues: Prisma.UserUpdateInput = {};
        if (!user.googleId) updatedValues.googleId = googleUserId;

        updatedValues.isDeleted = false;
        await this.prismaService.user.update({
            where: {
                id: user.id,
            },
            data: updatedValues,
        });
        const access_token = await this.signToken(user.id, user.email);
        return { access_token, user };
    }

    async deleteMyAccount(userId: number) {
        if (!userId) throw new BadRequestException('User ID is required');
        const user = await this.prismaService.user.findUnique({
            where: {
                id: userId,
                isDeleted: false,
            },
        });
        if (!user) throw new NotFoundException('User not found');
        await this.prismaService.user.update({
            where: {
                id: userId,
            },
            data: {
                isDeleted: true,
                verified: false,
            },
        });
        return { message: 'Account deleted successfully' };
    }

    async googleTokenInfo(accessToken: string) {
        // Correct for access_token
        const response = await axios.get(
            `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${accessToken}`,
        );
        const tokenInfo = response.data;
        return tokenInfo;
    }

    async googleUserInfo(accessToken: string) {
        const response = await axios.get(
            `https://www.googleapis.com/oauth2/v3/userinfo`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            },
        );
        const userInfo = response.data;
        return userInfo;
    }

    signTokenWithEmail(
        email: string,
        expiresIn: string = '30d',
    ): Promise<string> {
        const payload = {
            email,
        };
        return this.jwt.signAsync(payload, {
            expiresIn,
            secret: this.config.get('JWT_SECRET'),
        });
    }

    signToken(
        userId: number,
        email: string,
        expiresIn: string = '7d',
    ): Promise<string> {
        const payload = {
            sub: userId,
            email,
        };

        return this.jwt.signAsync(payload, {
            expiresIn,
            secret: this.config.get('JWT_SECRET'),
        });
    }

    async getUserFromToken(token: string) {
        const payload: { sub: number } = this.jwt.verify(token, {
            secret: this.config.get('JWT_SECRET'),
        });
        if (!payload) throw new ForbiddenException('Invalid token');
        const user = await this.userRepo.getUserById(payload.sub);
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    async logout(userId: number, data: LogoutDto) {
        if (!userId) throw new BadRequestException('User ID is required');
        return { message: 'Logged out successfully' };
    }
}
