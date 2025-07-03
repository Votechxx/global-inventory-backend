import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseFormatInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map((result) => {
                // Ensure result is an object and extract totalDocs if available
                const { data, totalDocs, ...rest } = result || {};
                const other = data ? rest : undefined;
                return {
                    message: 'Request successful',
                    ...(typeof totalDocs === 'number' ? { totalDocs } : {}),
                    ...(Array.isArray(data) ? { count: data.length } : {}),
                    ...(Array.isArray(result) ? { count: result.length } : {}),
                    data: data || result, // In case data is not structured as expected
                    ...other,
                };
            }),
        );
    }
}
