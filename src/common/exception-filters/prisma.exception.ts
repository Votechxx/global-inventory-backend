import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
    catch(
        exception: Prisma.PrismaClientKnownRequestError,
        host: ArgumentsHost,
    ) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();

        // Structured error logging
        console.error(
            `[PrismaExceptionFilter] Code: ${exception.code} | Message: ${exception.message}`,
            exception.meta || {},
        );

        const handleResponse = (statusCode: number, message: string) => {
            response.status(statusCode).json({ statusCode, message });
        };

        switch (exception.code) {
            case 'P2025': // Record not found
                return handleResponse(
                    HttpStatus.NOT_FOUND,
                    'Resource not found.',
                );

            case 'P2002': // Unique constraint violation
                const field =
                    (exception.meta?.target as string[])?.join(', ') ||
                    'Unknown field';
                return handleResponse(
                    HttpStatus.CONFLICT,
                    `Duplicate entry: ${field} already exists.`,
                );

            case 'P2003': // Foreign key constraint failure
                return handleResponse(
                    HttpStatus.BAD_REQUEST,
                    'Invalid foreign key reference.',
                );

            case 'P2004': // Constraint violation
                return handleResponse(
                    HttpStatus.BAD_REQUEST,
                    'Invalid input constraints.',
                );

            default:
                console.error(
                    '[PrismaExceptionFilter] Unexpected error occurred:',
                    exception,
                );
                return handleResponse(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    'Internal server error.',
                );
        }
    }
}
