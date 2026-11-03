import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { snakeCase } from 'lodash';

@Injectable()
export class ResponseTransformInterceptor
    implements NestInterceptor<unknown, unknown>
{
    intercept(
        context: ExecutionContext,
        next: CallHandler<unknown>,
    ): Observable<unknown> {
        return next
            .handle()
            .pipe(map((data) => this.transformKeysToSnakeCase(data)));
    }

    private transformKeysToSnakeCase(data: unknown): unknown {
        if (Array.isArray(data)) {
            return data.map((item) => this.transformKeysToSnakeCase(item));
        }
        if (data instanceof Date) {
            return data;
        }
        if (typeof data === 'object' && data !== null) {
            const snakeCased: Record<string, unknown> = {};
            for (const [key, value] of Object.entries(data)) {
                snakeCased[snakeCase(key)] =
                    this.transformKeysToSnakeCase(value);
            }
            return snakeCased;
        }
        return data;
    }
}
