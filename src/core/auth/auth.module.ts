import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy';
import { UserRepo } from '../user/repo/user.repo';
import { UserHelper } from '../user/helpers/user.helper';

@Module({
    imports: [UserModule, JwtModule.register({})],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, UserRepo, UserHelper],
    exports: [AuthService],
})
export class AuthModule {}
