import {
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Injectable,
} from '@nestjs/common';
import { AuthService } from 'src/core/auth/auth.service';

@Injectable()
export class CurrentUserInterceptor implements NestInterceptor {
    constructor(private authService: AuthService) {}
    async intercept(context: ExecutionContext, handler: CallHandler) {
        const request = context.switchToHttp().getRequest();
        const token = request.headers.authorization?.split(' ')[1];
        if (token) {
            try {
                const user = await this.authService.getUserFromToken(token);
                request.user = user;
            } catch (error) {
                console.error('Error in CurrentUserInterceptor:', error);
                console.log('Token:', token);
                console.log('No user found');
            }
        }
        return handler.handle();
    }
}
