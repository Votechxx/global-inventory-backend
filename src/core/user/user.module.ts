import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepo } from './repo/user.repo';
import { UserHelper } from './helpers/user.helper';

@Module({
    controllers: [UserController],
    providers: [UserService, UserRepo, UserHelper],
    exports: [UserService, UserRepo],
})
export class UserModule {}
