import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Patch,
    Post,
    Query,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiBody, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorator/get-user.decorator';
import {
    GoogleLoginDto,
    CheckOtpDto,
    LoginDto,
    LogoutDto,
    ResetPasswordDto,
    SignupDto,
    UpdatePasswordDto,
} from './dto/auth.dto';
import { Request, Response } from 'express';
import { getCleanIp } from 'src/common/utils/cleanIp';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Login',
        description: 'Login with email and password',
    })
    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @ApiOperation({
        summary: 'Google Login',
        description: 'Login with google account',
    })
    @Post('google-login')
    async googleLogin(
        @Body() googleLoginDto: GoogleLoginDto,
        @Req() req: Request,
    ) {
        const ip = req.ip;
        return this.authService.googleSignIn(googleLoginDto, getCleanIp(ip));
    }

    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Signup',
        description: 'Signup: creating my new account',
    })
    @Post('signup')
    async signup(@Body() signupDto: SignupDto, @Req() req: Request) {
        return this.authService.signup(signupDto, getCleanIp(req.ip));
    }

    @ApiOperation({
        summary: 'Forget Password',
        description: 'Forget Password: send email to reset password',
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                email: {
                    type: 'string',
                    example: 'example@gmail.com',
                    description: "User's email",
                },
            },
            required: ['email'],
        },
    })
    @Post('forget-password')
    async forgetPassword(@Body('email') email: string) {
        return this.authService.forgetPassword(email);
    }

    @ApiOperation({
        summary: 'Reset Password',
        description: 'Reset Password: reset password with OTP',
    })
    @Patch('reset-password')
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        return this.authService.resetPassword(resetPasswordDto);
    }

    @ApiOperation({
        summary: 'Change Password',
        description: 'Change Password: change password for the logged in user',
    })
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('default')
    @Patch('users/me/password')
    async updatePassword(
        @GetUser('id') id: number,
        @Body() updatePasswordDto: UpdatePasswordDto,
    ) {
        return this.authService.updatePassword(+id, updatePasswordDto);
    }

    @ApiOperation({
        summary: 'Verify Account',
        description: 'Verify Account: verify account with token',
    })
    @Get('verify-account')
    async verifyAccount(
        @Query('token') token: string,
        @Query('otp') otp: string,
        @Res() res: Response,
    ) {
        await this.authService.verifyEmail(token, otp);
        return res.render('verified'); // renders views/verified.pug
    }

    @Post('check-otp')
    @ApiOperation({
        summary: 'Check OTP',
        description: 'Check OTP: check OTP for reset password',
    })
    async checkOtp(@Body() checkOtpDto: CheckOtpDto) {
        return this.authService.checkOtp(checkOtpDto);
    }

    @Patch('logout')
    @ApiOperation({
        summary: 'Logout',
        description: 'Logout: logout from the current device',
    })
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('default')
    async logout(@Body() logout: LogoutDto, @GetUser('id') id: number) {
        return this.authService.logout(id, logout);
    }
}
