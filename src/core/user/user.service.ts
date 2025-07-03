import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Prisma, RoleEnum, User } from '@prisma/client';
import { UserCreationMethod } from './enum/creation-method.enum';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import {
    userPrivateFields,
    userPublicFields,
    userSecretFields,
} from './helpers/user-selection-fields';
import {
    UpdateUserDataDto,
    UserQueryDto,
    AdminCreateUserDto,
    UpdateUserDto,
} from './dto/user.dto';
import { hash } from 'argon2';
import { UserRepo } from './repo/user.repo';
import { UserHelper } from './helpers/user.helper';

@Injectable()
export class UserService {
    constructor(
        private prismaService: PrismaService,
        private readonly userRepo: UserRepo,
        private readonly userHelper: UserHelper,
    ) {}

    async updateMyData(id: number, data: UpdateUserDataDto) {
        console.log({ id, data });
        const user = await this.prismaService.user.findUnique({
            where: {
                id,
                isDeleted: false,
            },
        });
        if (!user) throw new NotFoundException('User not found');
        const result = await this.prismaService.$transaction(async (prisma) => {
            const { ...rest } = data;
            const userData = rest;
            const updatedUser = await prisma.user.update({
                where: {
                    id,
                },
                data: {
                    zipCode: userData.zipCode,
                    city: userData.city,
                    phoneNumber: userData.phoneNumber,
                    address: userData.address,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                },
                select: userPublicFields,
            });

            return updatedUser;
        });
        return result;
    }

    async update(id: number, data: UpdateUserDto) {
        console.log({ id, data });
        if (data.password) data.password = await hash(data.password);
        const user = await this.prismaService.user.findUnique({
            where: {
                id,
                isDeleted: false,
                role: {
                    notIn: ['ADMIN'],
                },
            },
        });
        if (!user) throw new NotFoundException('User not found');
        const result = await this.prismaService.$transaction(async (prisma) => {
            const { ...rest } = data;
            const userData = rest;
            const updatedUser = await prisma.user.update({
                where: {
                    id,
                },
                data: {
                    ...userData,
                },
                select: userPublicFields,
            });
            return updatedUser;
        });
        return result;
    }

    async deleteUser(userId: number) {
        const user = await this.prismaService.user.findUnique({
            where: {
                id: userId,
                role: {
                    notIn: ['ADMIN'],
                },
            },
        });
        if (!user) throw new NotFoundException('User not found');
        const result = await this.prismaService.user.update({
            where: {
                id: userId,
            },
            data: {
                isDeleted: true,
            },
        });
        return result;
    }

    async createUser(createUserDto: AdminCreateUserDto) {
        createUserDto.password = await hash(createUserDto.password);
        if (createUserDto.role === 'ADMIN')
            throw new ForbiddenException(
                'Admin can only be created by the system!',
            );
        const username = await this.userHelper.suggestUsername(
            createUserDto.firstName,
        );
        const newUser = await this.userRepo.createUserByRole({
            ...createUserDto,
            username,
            userCreationMethod: UserCreationMethod.MANUAL,
        });
        return newUser;
    }

    async getUsers(userQueryDto: UserQueryDto, user: User) {
        const {
            page = 1,
            limit = 20,
            name,
            email,
            address,
            phoneNumber,
            ...filter
        } = userQueryDto;
        const take = Math.min(limit, 50);
        const skip = (page - 1) * take;

        const where: Prisma.UserWhereInput = {
            ...filter,
        };
        if (user.role !== 'ADMIN')
            where.role = {
                notIn: ['ADMIN', 'GUARD', 'USER'],
            };
        if (name) {
            where.firstName = {
                contains: name,
                mode: 'insensitive',
            };
            where.lastName = {
                contains: name,
                mode: 'insensitive',
            };
        }

        if (email)
            where.email = {
                contains: email,
                mode: 'insensitive',
            };
        if (address)
            where.address = {
                contains: address,
                mode: 'insensitive',
            };
        if (phoneNumber)
            where.phoneNumber = {
                contains: phoneNumber,
                mode: 'insensitive',
            };
        const users = await this.prismaService.user.findMany({
            where,
            take,
            skip,
            select:
                user.role === RoleEnum.ADMIN
                    ? userSecretFields
                    : user.role === RoleEnum.GUARD
                      ? userPrivateFields
                      : userPublicFields,
        });
        const count = await this.prismaService.user.count({
            where,
        });
        return {
            totalDocs: count,
            count: users.length,
            users,
        };
    }

    async getUserById(userId: number) {
        const user = await this.prismaService.user.findUnique({
            where: {
                id: userId,
            },
            select: userPrivateFields,
        });
        if (!user) throw new NotFoundException('User not found');
        return user;
    }
}
