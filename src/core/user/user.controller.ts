import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { RoleEnum, User } from '@prisma/client';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import {
    UpdateUserDataDto,
    UserQueryDto,
    AdminCreateUserDto,
    UpdateUserDto,
} from './dto/user.dto';

@ApiTags('User')
@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('default')
    @ApiOperation({
        summary: 'Get my data',
        description:
            'Get my profile, userType: [user, teacher, admin], userId: 1, 2, 3',
    })
    @Get('me')
    async getMe(@GetUser() user: User) {
        return await this.userService.getUserById(user.id);
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('default')
    @ApiOperation({
        summary: 'Update my data',
        description: 'Each user updates his profile',
    })
    @Patch('me')
    async updateMe(
        @GetUser('id') id: number,
        @Body() updateMyDateDto: UpdateUserDataDto,
    ) {
        return await this.userService.updateMyData(+id, updateMyDateDto);
    }

    @ApiBearerAuth('default')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.ADMIN)
    @ApiOperation({
        summary: 'Update user data for admin only',
        description: 'update user profile',
    })
    @Patch(':id')
    async update(
        @Param('id') id: number,
        @Body() updateUserDto: UpdateUserDto,
    ) {
        return await this.userService.update(+id, updateUserDto);
    }

 @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.ADMIN)
    @ApiBearerAuth('default')
    @ApiOperation({
        summary: 'Create a new user (worker)',
        description: 'Create a new user (worker) by admin with inventory assignment',
    })
    @Post()
    createUser(@Body() createUserDto: AdminCreateUserDto, @GetUser() user: User) {
        return this.userService.createUser(createUserDto);
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.ADMIN)
    @ApiBearerAuth('default')
    @ApiOperation({
        summary: 'Delete user',
        description: 'Delete user by admin',
    })
    @Delete(':id')
    deleteUser(@Param('id') userId: number) {
        return this.userService.deleteUser(userId);
    }

    @Get()
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('default')
    @ApiOperation({
        description: 'get users for any one',
        summary: 'get Users',
    })
    async getUsers(@Query() userQueryDto: UserQueryDto, @GetUser() user: User) {
        return this.userService.getUsers(userQueryDto, user);
    }
}
