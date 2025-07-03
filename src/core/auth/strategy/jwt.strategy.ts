import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../common/modules/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        config: ConfigService,
        private prisma: PrismaService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: config.get('JWT_SECRET'),
            passReqToCallback: true,
        });
    }

    // TODO - Implement validate method
    async validate(req: Request, payload: any) {
        console.log({ payload });
        const user = await this.prisma.user.findUnique({
            where: {
                id: payload.sub,
            },
            select: {
                email: true,
                id: true,
                firstName: true,
                lastName: true,
                username: true,
                role: true,
                gender: true,
                dob: true,
                phoneNumber: true,
                isDeleted: true,
            },
        });
        if (user) {
            if (user.isDeleted)
                throw new ForbiddenException(
                    'This account has been deleted. Please contact support for more information.',
                );
        }
        return user;
    }
}
