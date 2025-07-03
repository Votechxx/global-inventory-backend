import {
    BadRequestException,
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { USER_DATA } from '../decorator/user-fields.decorator';

@Injectable()
export class FieldGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredFields = this.reflector.get<string[]>(
            USER_DATA,
            context.getHandler(),
        );
        if (!requiredFields || !requiredFields.length) {
            return true;
        }
        const { user } = context.switchToHttp().getRequest();
        if (!user) {
            throw new UnauthorizedException(
                `User is not authorized to access this resource`,
            );
        }
        for (const field of requiredFields) {
            if (!user[field]) {
                throw new BadRequestException(
                    `Field ${field} is required to make this operation, please update your profile`,
                );
            }
        }
        return true;
    }
}
